"use strict"

const path = require("path")
const fs = require("fs")
const redis = require("redis")
const express = require("express")
const bodyParser = require('body-parser')
const http = require('http')
const socket_io = require("socket.io")
const session = require('express-session')
const cookieParser = require('cookie-parser')
const connectRedis = require("connect-redis")
const neo4j = require('@bryanph/neo4j-driver').v1
const elasticsearch = require('elasticsearch')
const mongoose = require("mongoose")
mongoose.Promise = global.Promise; // use ES6 promises
const { setupAuthMiddleware } = require('full-auth-middleware')
require('isomorphic-fetch');

const config = require("./config/config.js")
const authConfig = require('./config/auth')

const createCollectionApi = require("./api/private/Collection")
const createNodeApi = require('./api/private/Node')
const createUserApi = require('./api/private/User')
const createSourceApi = require('./api/private/Source')

const moment = require('moment')

/*
 * setup handlebars with express
*/
const handlebars = require('handlebars')
const layouts = require('handlebars-layouts')
const exphbs = require('express-handlebars')

handlebars.registerHelper(layouts(handlebars))
handlebars.registerPartial('layout', fs.readFileSync(path.join(__dirname, './views/layouts/main.hbs'), 'utf-8'))


let app = express();
let server = http.Server(app)
let io = socket_io(server)

/*
 * Redis
*/
const redisClient = redis.createClient()
redisClient.on('error', (error) => console.error(error))

const RedisStore = connectRedis(session)
var sessionStore = new RedisStore({ client: redisClient });

const sessionMiddleware = session({
    key: 'connect.sid',
    secret: 'foo',
    resave: true,
    saveUninitialized: true,
    store: sessionStore
})

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: false,
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
}))
app.set('view engine', '.hbs');
app.set('views',__dirname + '/views')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('foo'));
app.use(sessionMiddleware)

app.use(function(req, res, next) {
    // useful to have on request object
    // TODO: use hofs for this instead - 2017-06-04
    req.redisClient = redisClient
    req.app = app
    req.io = io

    next()
})

/*
 * Setup connections
*/

app.db = mongoose.createConnection(config.database.url);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
      //and... we have a data store
    });

const driver = neo4j.driver(
    config.neo4j.url,
    neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
    {
        convertToString: true
    }
)
const db = driver.session();

const es = elasticsearch.Client({
  host: 'localhost:9200',
  log: [{
      type: 'stdio',
      levels: ['error', 'warning']
  }]
})

const NodeApi = createNodeApi(db, es)
const CollectionApi = createCollectionApi(db, es)
const sourceApi = createSourceApi(db, es)
const UserApi = createUserApi(app, db, redisClient, es)

const { authRoutes, adminRoutes } = setupAuthMiddleware(app, mongoose, Object.assign(authConfig, {
        onSignup: function(user) {
            return CollectionApi.createRootCollection(user)
                .then(result => {
                    // save the id of the root collection on the user object
                    user.rootCollectionId = result.id
                    return user.save()
                })
        }
    })
)

// initialize routes
require('./routes')(app, authRoutes, adminRoutes);


io.use(function(socket, next) {
    // wrap with session (this mutates socket.request)
    sessionMiddleware(socket.request, {}, next)

})
.use(function(socket, next) {
    // now deserialize user...
    if (!socket.request.session.passport) {
        return next("failed")
    }

    const id = socket.request.session.passport.user


    // TODO: factor this out? - 2016-08-11
    app.db.models.User.findOne({ _id: id }, { password: 0 })
        .populate('roles.admin')
        .populate('roles.account')
        .exec(function(err, user) {
            if (user && user.roles && user.roles.admin) {
                user.roles.admin.populate("groups", function(err, admin) {
                    // TODO: must be admin here? - 2016-08-11
                    socket.request.user = user
                    next()
                });
            }
            else {
                socket.request.user = user
                next()
            }
        });
})
io.on('connection', function(socket) {
    socket.emit('connected', 'connected');

    const user = socket.request.user;

    if (!user) {
        return;
    }

    // this binds the events
    sourceApi(user, socket)

    socket.on('User.generateMobileUploadToken', UserApi.generateMobileUploadToken.bind(null, socket, user));

    socket.on('Node.get', NodeApi.get.bind(null, user));
    // TODO: rename to getL1 - 2016-08-01
    socket.on('Node.getL1', NodeApi.getL1.bind(null, user));
    socket.on('Node.getL2', NodeApi.getL2.bind(null, user));
    socket.on('Node.create', NodeApi.create.bind(null, user));
    socket.on('Node.update', NodeApi.update.bind(null, user));
    // socket.on('Node.duplicate', NodeApi.duplicate.bind(null, user));
    socket.on('Node.remove', NodeApi.remove.bind(null, user));
    socket.on('Node.connect', NodeApi.connect.bind(null, user));
    socket.on('Node.addEdge', NodeApi.addEdge.bind(null, user));
    socket.on('Node.removeEdge', NodeApi.removeEdge.bind(null, user));
    socket.on('Node.search', NodeApi.search.bind(null, user));
    socket.on('Node.searchAll', NodeApi.searchAll.bind(null, user));

    /*
     * gets collection with its nodes
    */
    socket.on('Collection.get', CollectionApi.get.bind(null, user));

    /*
     * gets collection with its nodes and their direct neighbours
    */
    socket.on('Collection.getL1', CollectionApi.getL1.bind(null, user));

    socket.on('Collection.getAll', CollectionApi.getAll.bind(null, user));

    // socket.on('Collection.getByIds', CollectionApi.getByIds.bind(null, user));
    socket.on('Collection.create', CollectionApi.create.bind(null, user));
    socket.on('Collection.remove', CollectionApi.remove.bind(null, user));
    socket.on('Collection.addNode', CollectionApi.addNode.bind(null, user));
    socket.on('Collection.removeNode', CollectionApi.removeNode.bind(null, user));
    socket.on('Collection.moveNode', CollectionApi.moveNode.bind(null, user));

})

// io.use(passportSocketIo.authorize({
//   cookieParser: cookieParser,
//   key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
//   secret:       'foo',    // change this
//   store:        sessionStore,
//   success:      onAuthorizeSuccess,
//   fail:         onAuthorizeFail,
// }));

function onAuthorizeSuccess(data, accept){
  accept();
}

function onAuthorizeFail(data, message, isError, accept){
  // see: http://socket.io/docs/client-api/#socket > error-object
  // TODO: REMOVE - 2016-03-28
  accept();

  console.error('failed connection to socket.io:', message);

  if(isError)
    accept(new Error(message));
}

server.listen(config.port, "0.0.0.0")

console.log(`listening on port ${config.port}`);
