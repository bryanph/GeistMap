'use strict';
const Async = require('async');
const promptly = require('promptly');
const neo4j = require('@bryanph/neo4j-driver').v1
const elasticsearch = require('elasticsearch')

const config = require('../../server/config/config.js')
const authConfig = require('../../server/config/auth.js')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise; // use ES6 promises

const mongoDb = mongoose.createConnection(config.database.url);
const app = { db: mongoDb } // mock express app object for now...

const driver = neo4j.driver(
    config.neo4j.url,
    neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
    {
        convertToString: true
    }
)
const session = driver.session();
const session2 = driver.session();
const session3 = driver.session();

const es = elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error', 'warning']
    }]
})

const {
    EditorState,
    Entity,
    DefaultDraftBlockRenderMap,
    convertToRaw,
    convertFromRaw
} = require('draft-js');

const createNodeApi = require('../../server/api/private/Node')

mongoDb.on('error', (error) => console.error('mongoose connection error: ' + error.message));
mongoDb.once('open', () => start().catch(e => console.log(e)))

async function start() {

    require('full-auth-middleware/schema/Note')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Status')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/StatusLog')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Category')(app, mongoose, authConfig);

    require('full-auth-middleware/schema/User')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Admin')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/AdminGroup')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Account')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/LoginAttempt')(app, mongoose, authConfig);

    await session.run(`
        MATCH (r:RootCollection)
        SET r:Node:Collection:RootCollection
        `)

    console.log("done!")
    process.exit(0)
}


