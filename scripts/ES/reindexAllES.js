'use strict';
const config = require('../../server/config/config.js')
const auth = require('../../server/config/auth.js')
const elasticsearch = require('elasticsearch')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise; // use ES6 promises

const db = mongoose.createConnection(config.database.url);
const app = { db } // mock express app object for now...
const neo4j = require('@bryanph/neo4j-driver').v1

const { updateIndex } = require('../../server/fulltext')

const driver = neo4j.driver(
    config.neo4j.url,
    neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
    {
        convertToString: true
    }
)
const neo4jSession = driver.session();

db.on('error', (error) => console.error('mongoose connection error: ' + error.message));
db.once('open', () => {
    require('full-auth-middleware/schema/Note')(app, mongoose, auth);
    require('full-auth-middleware/schema/Status')(app, mongoose, auth);
    require('full-auth-middleware/schema/StatusLog')(app, mongoose, auth);
    require('full-auth-middleware/schema/Category')(app, mongoose, auth);

    require('full-auth-middleware/schema/User')(app, mongoose, auth);
    require('full-auth-middleware/schema/Admin')(app, mongoose, auth);
    require('full-auth-middleware/schema/AdminGroup')(app, mongoose, auth);
    require('full-auth-middleware/schema/Account')(app, mongoose, auth);
    require('full-auth-middleware/schema/LoginAttempt')(app, mongoose, auth);


    const es = elasticsearch.Client({
        host: 'localhost:9200',
        log: [{
            type: 'stdio',
            levels: ['error', 'warning']
        }]
    })

    // update node indexes
    neo4jSession
        .run(
            "MATCH (u:User)--(n:Node) " +
            "RETURN u.id as userid, properties(n) as node"
        )
        .subscribe({
            onNext: (record) => {
                const user = record.get('userid')
                const node = record.get('node')

                // index the node
                updateIndex(es, user, node)
            },
            onCompleted: () => {
                console.log('we are done!');

            },
            onError: () => {
                console.log(error)
            }
        })


    // update collection indexes
})
