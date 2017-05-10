'use strict';
const config = require('../server/config/config.js')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise; // use ES6 promises

const db = mongoose.createConnection(config.database.url);
const app = { db } // mock express app object for now...
const neo4j = require('neo4j-driver').v1

const { updateIndex } from '../server/fulltext'

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic(config.neo4j.user, config.neo4j.password))
const neo4jSession = driver.session();

db.on('error', (error) => console.error('mongoose connection error: ' + error.message));
db.once('open', async () => {
    require('full-auth-middleware/schema/Note')(app, mongoose, config);
    require('full-auth-middleware/schema/Status')(app, mongoose, config);
    require('full-auth-middleware/schema/StatusLog')(app, mongoose, config);
    require('full-auth-middleware/schema/Category')(app, mongoose, config);

    require('full-auth-middleware/schema/User')(app, mongoose, config);
    require('full-auth-middleware/schema/Admin')(app, mongoose, config);
    require('full-auth-middleware/schema/AdminGroup')(app, mongoose, config);
    require('full-auth-middleware/schema/Account')(app, mongoose, config);
    require('full-auth-middleware/schema/LoginAttempt')(app, mongoose, config);


    const es = elasticsearch.Client({
        host: 'localhost:9200',
        log: [{
            type: 'stdio',
            levels: ['error', 'warning']
        }]
    })

    db.run(
        "MATCH (u:User)--(c:Node)-[r]-(:Node) " +
        "WHERE u.id = {userId} " +
        "RETURN collect(c) as nodes, collect(r) as edges",
        {
            userId: user._id.toString()
        }
    )
        .then((results) => {
            return res(null, {
                nodes: results.records[0]._fields[0].map(mapIdentity),
                edges: results.records[0]._fields[1].map(mapEdges),
            })
        })



    let currentUser = null

    // update node indexes
    neo4jSession
        .run(
            "MATCH (u:User)--(n:Node) " +
            "RETURN u.id as userid, n as node",
        )
        .subscribe({
            onNext: (record) => {
                const user = record.get('userid')
                const node = record.get('node')
                if (user) {
                    currentUser = user;
                }

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
