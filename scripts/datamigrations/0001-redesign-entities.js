'use strict';
const Async = require('async');
const promptly = require('promptly');
const neo4j = require('neo4j-driver').v1
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

    const nodeApi = createNodeApi(session2, es)

        // create a root collection for every user
        await session.run(`
            MATCH (u:User)
            CREATE (r:RootCollection {
                id: apoc.create.uuid(),
                name: "My Knowledge Base",
                isRootCollection: true,
                type: "root",
                created: timestamp(),
                modified: timestamp()
            })<-[:AUTHOR]-(u)
        `)

        // set an id for every node and collection
        await session.run(`
            MATCH (n)
            WHERE n:Node OR n:Collection
            SET n.id = apoc.create.uuid()
        `)

        // set the type to "node"
        await session.run(`
            MATCH (n)
            WHERE n:Node
            SET n.type = "node"
        `)

        // set the type to "collection"
        await session.run(`
            MATCH (n)
            WHERE n:Collection
            SET n.type = "collection"
        `)

        // for every edge, set an id, start and end
        await session.run(`
            MATCH (n1)-[e]->(n2)
            SET e.id = apoc.create.uuid()
            SET e.start = n1.id
            SET e.end = n2.id
        `)

        // rename all :PARENT labels to :AbstractEdge
        await session.run(`
            MATCH (n1)-[e:PARENT]->(n2)
            CREATE (n1)-[e2:AbstractEdge]->(n2)
            SET e2 = e
            WITH e
            DELETE e
        `)

        // rename all :IN labels to :AbstractEdge
        await session.run(`
            MATCH (n1)-[e:IN]->(n2)
            CREATE (n1)-[e2:AbstractEdge]->(n2)
            SET e2 = e
            WITH e
            DELETE e
        `)

        // connect all collections that are not connected to a collection to the root collection
        await session.run(`
            MATCH (rc:RootCollection)--(u:User)--(c:Collection)
            WHERE NOT (c)-[:AbstractEdge]->(:Collection)
            CREATE (c)-[e:AbstractEdge {
                id: apoc.create.uuid(),
                start: c.id,
                end: rc.id
            }]->(rc)
        `)

        // set the correct labels on the root node
        await session.run(`
            MATCH (n)
            WHERE n:RootCollection
            SET n:Collection:RootCollection
        `)


    const results = await session.run(`
        MATCH (u:User)--(n:Node) RETURN u.id as userId, n.id as nodeId, n.editorState as editorState
    `)

    console.log(`got ${results.records.length} results, starting...`)
    let count = 0

    for (let row of results.records) {
        const userId = row.get('userId')
        const nodeId = row.get('nodeId')
        const rawEditorState = row.get('editorState')

        if (!rawEditorState) {
            continue;
        }

        const editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(rawEditorState)))
        const contentState = editorState.getCurrentContent()
        const entityMap = editorState.getCurrentContent().getEntityMap().getMap()

        let newContentState = contentState;

        for (let [key, obj] of entityMap) {
            if (obj.type === "CONTENT_LINK") {
                const { nodeId, edgeId, text } = obj.data

                if (nodeId === undefined || edgeId === undefined) {
                    continue;
                }

                let newNodeId, newEdgeId;
                try {
                    const result = await session.run(
                        `MATCH (n:Node) WHERE id(n) = { id } RETURN n.id as id`,
                        { id: neo4j.int(nodeId) }
                    )
                    newNodeId = result.records[0].get('id')

                }
                catch (e) {
                    newNodeId = nodeId
                }

                try {
                    const result = await session.run(
                        `MATCH ()-[e:EDGE]->() WHERE id(e) = { id } RETURN e.id as id`,
                        { id: neo4j.int(edgeId) }
                    )
                    newEdgeId = result.records[0].get('id')
                }
                catch (e) {
                    newEdgeId = edgeId
                }

                const newData = {
                    nodeId: newNodeId,
                    edgeId: newEdgeId,
                    text: text,
                }

                newContentState = contentState.replaceEntityData(key, newData)
            }
        }


        const newProperties = {
            editorPlainText: newContentState.getPlainText(),
            editorState: JSON.stringify(convertToRaw(newContentState))
        }

        try {
            await session.run(`
                        MATCH (u:User)--(n)
                        WHERE u.id = {userId} AND (n:Node OR n:Collection)
                        AND n.id = {id}
                        SET n += { data }
                    `,
                {
                    userId: userId,
                    id: nodeId,
                    data: newProperties,
                }
            )
        } catch (e) {
            console.log(e)
        }

        editorState.getCurrentContent().getEntityMap().clearMap()
    }

    console.log("DONE!")
    process.exit(0)
}


