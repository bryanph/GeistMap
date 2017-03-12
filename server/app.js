"use strict"

import path from "path"
import fs from "fs"
import redis from "redis"
import express from "express"
import exphbs from 'express-handlebars'
import bodyParser from 'body-parser'
import http from 'http'
import socket_io from "socket.io"
// import passportSocketIo from "passport.socketio"
import session from 'express-session'
import cookieParser from 'cookie-parser'
import connect_mongo from "connect-mongo"
import connectRedis from "connect-redis";
const neo4j = require('neo4j-driver').v1
import elasticsearch from 'elasticsearch'
import mongoose from "mongoose"
mongoose.Promise = global.Promise; // use ES6 promises

import config from "./config/config.js"
import DatabaseContainer from './utils/DatabaseContainer'

require('es6-promise').polyfill();
require('isomorphic-fetch');

let app = express();
let server = http.Server(app)
let io = socket_io(server)

/*
 * Redis
*/
const redisClient = redis.createClient()
redisClient.on('error', (error) => console.error(error))

// const MongoStore = connect_mongo(session)
// let sessionStore = new MongoStore(config.database)

const RedisStore = connectRedis(session)
var sessionStore = new RedisStore({ client: redisClient });

const sessionMiddleware = session({
    key: 'connect.sid',
    secret: 'foo',
    resave: true,
    saveUninitialized: true,
    store: sessionStore
})

app.set('view engine', 'jade');
app.set('views', [ 
    __dirname + '/views', 
    __dirname + '/node_modules/full-auth-middleware/views' 
])

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('foo'));
app.use(sessionMiddleware)

app.use(function(req, res, next) {
    // useful to have on request object
    req.redisClient = redisClient
    req.app = app
    req.io = io

    next()
})


/*
 * DRYWALL SPECIFIC
*/
app.db = mongoose.createConnection(config.database.url);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
      //and... we have a data store
    });

import authConfig from './config/auth'
const { setupAuthMiddleware } = require('full-auth-middleware')

const { authRoutes, adminRoutes } = setupAuthMiddleware(app, mongoose, authConfig)

require('./routes')(app, authRoutes, adminRoutes);

// app.use(express.cookieParser('your secret here'));

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic(config.neo4j.user, config.neo4j.password))
const db = driver.session();

const es = elasticsearch.Client({
  host: 'localhost:9200',
  log: [{
      type: 'stdio',
      levels: ['error', 'warning']
  }]
})

DatabaseContainer.setDb(db);
DatabaseContainer.setIo(io);


import createCollectionAPI from "./api/private/Collections"
import createNodeAPI from './api/private/Node'
import createUserAPI from './api/private/User'

const NodeAPI = createNodeAPI(db, es)
const CollectionAPI = createCollectionAPI(db, es)
const UserAPI = createUserAPI(app, db, redisClient, es)

io.use(function(socket, next) {
    // wrap with session (this mutates socket.request)
    socket.redisClient = redisClient
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

    socket.on('User.updateUi', UserAPI.updateUi.bind(null, user));
    socket.on('User.generateMobileUploadToken', UserAPI.generateMobileUploadToken.bind(null, socket, user));

    socket.on('Node.get', NodeAPI.get.bind(null, user));
    // TODO: rename to getL1 - 2016-08-01
    socket.on('Node.getWithNeighbours', NodeAPI.getWithNeighbours.bind(null, user));
    socket.on('Node.getL2', NodeAPI.getL2.bind(null, user));
    socket.on('Node.getAll', NodeAPI.getAll.bind(null, user));
    socket.on('Node.getInboxNodes', NodeAPI.getInboxNodes.bind(null, user));
    socket.on('Node.create', NodeAPI.create.bind(null, user));
    socket.on('Node.update', NodeAPI.update.bind(null, user));
    socket.on('Node.duplicate', NodeAPI.duplicate.bind(null, user));
    socket.on('Node.remove', NodeAPI.remove.bind(null, user));
    socket.on('Node.connect', NodeAPI.connect.bind(null, user));
    socket.on('Node.addEdge', NodeAPI.addEdge.bind(null, user));
    socket.on('Node.removeEdge', NodeAPI.removeEdge.bind(null, user));
    socket.on('Node.search', NodeAPI.search.bind(null, user));
    socket.on('Node.searchAll', NodeAPI.searchAll.bind(null, user));
    socket.on('Node.createBatchNode', NodeAPI.createBatchNode.bind(null, user));
    socket.on('Node.getAllBatchNodes', NodeAPI.getAllBatchNodes.bind(null, user));
    socket.on('Node.clearBatchNodes', NodeAPI.clearBatchNodes.bind(null, user));

    socket.on('Collection.get', CollectionAPI.get.bind(null, user));
    // socket.on('Collection.getByIds', CollectionAPI.getByIds.bind(null, user));
    socket.on('Collection.getAll', CollectionAPI.getAll.bind(null, user));
    socket.on('Collection.create', CollectionAPI.create.bind(null, user));
    socket.on('Collection.update', CollectionAPI.update.bind(null, user));
    socket.on('Collection.remove', CollectionAPI.remove.bind(null, user));
    socket.on('Collection.connect', CollectionAPI.connect.bind(null, user));
    socket.on('Collection.removeEdge', CollectionAPI.removeEdge.bind(null, user));
    socket.on('Collection.addNode', CollectionAPI.addNode.bind(null, user));
    socket.on('Collection.removeNode', CollectionAPI.removeNode.bind(null, user));
    socket.on('Collection.search', CollectionAPI.search.bind(null, user));

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

server.listen(config.port)

console.log(`listening on port ${config.port}`);
