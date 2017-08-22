const neo4j = require('neo4j-driver').v1
const elasticsearch = require('elasticsearch')
const ObjectID = require('mongodb').ObjectID

const uuidV4 = require('uuid/v4');
jest.mock('uuid/v4')
const uuidV4Actual = require.requireActual('uuid/v4');

const createCollectionApi = require('./index.js')
const config = require('../../../config/config.test.js')

const sortBy = require('lodash/sortBy')


const userId = new ObjectID()
const rootCollectionId = "__TEST__123456789"
// id is all the API needs to know
const user = {
    _id: userId,
}
let collectionApi, db, es;

const sortById = (x) => sortBy(x, 'id')

async function getUserGraphData(db, userId) {
    /*
    * Gets the full graph data for the user in JSON format
    */
    const result = await db.run(`
        MATCH (u:User)-[e*]-(n) WHERE u.id = "${userId.toString()}"
        UNWIND e AS edges
        RETURN collect(distinct properties(n)), collect(distinct properties(edges))
        `)

        return {
            nodes: result.records[0]._fields[0],
            edges: result.records[0]._fields[1],
        }
    }

    function loadFixtures(db, userId, nodes=[], edges=[]) {
        /*
        * loads JSON
        * accepts an object of nodes and edges
        */
        let nodeInserts = []
        let edgeInserts = []

        // create user
        nodeInserts.push([`CREATE (n:User { id: "${userId}" })`, { id: userId } ])

        nodes.forEach(n => {
            nodeInserts.push([`
                MATCH (u:User) WHERE u.id = "${userId}"
                CREATE (n:${n.labels} { properties })<-[:AUTHOR]-(u)
                `,
                {
                    properties: n.properties || {},
                }
            ])
        })

        edges.forEach(e => {
            edgeInserts.push([`
                MATCH (n1), (n2)
                WHERE n1.id = ${e.start} AND n2.id = ${e.end}
                CREATE (n1)-[e:${e.labels} { properties }]->(n2)
                `,
                { properties: e.properties || {} }
            ])
        })

        return db.writeTransaction(tx => {
            return Promise.all([
                ...nodeInserts.map(statement => tx.run(...statement)),
                ...edgeInserts.map(statement => tx.run(...statement))
            ])
        })
    }

    describe('collectionApi', () => {
        beforeAll(() => {
            const driver = neo4j.driver(
                config.neo4j.url,
                neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
                {
                    convertToString: true
                }
            )

            db = driver.session();
            es = elasticsearch.Client({
                host: 'http://localhost:9200',
                log: [{
                    type: 'stdio',
                    levels: ['error', 'warning']
                }]
            })

            collectionApi = createCollectionApi(db, es)
        })

        afterEach(() => {
            // cleanup
            db.run(`
                MATCH (u:User)-[*]-(n) WHERE u.id = "${userId.toString()}"
                DETACH DELETE n
                `)
        })

        test('test createRootCollection', async () => {
            /*
            * 1. Should create the User object since it doesn't exist yet
            * 2. Should create the root collection
            */

            const id = "abc"
            uuidV4.mockImplementationOnce(() => id)

            const result = await collectionApi.createRootCollection(user)
            const graphState = await getUserGraphData(db, userId)

            expect(graphState).toMatchObject({
                nodes: [{
                    name: 'My Knowledge Base',
                    // modified: '1503323527535',
                    id: 'abc',
                    type: 'root',
                    isRootCollection: true,
                    // created: '1503323527535'
                }],
                edges: [ {} ]
            })
        })

        test('test Collection.create() correctly creates a collection', () => {
            // TODO: Also test full-text indexing occurs

            const id = uuidV4Actual()
            const edgeId = uuidV4Actual()
            const parentId = uuidV4Actual()
            const node = {
                "name": "wowzers"
            }
            uuidV4.mockImplementationOnce(() => edgeId)

            return loadFixtures(db, userId.toString(), [
                {
                    labels: "Collection:RootCollection" ,
                    properties: {
                        "isRootCollection": true,
                        "created": 1503389225848,
                        "name": "My Knowledge Base",
                        "modified": 1503389225848,
                        "id": parentId,
                        "type": "root"
                    }
                }
            ])
            .then(() => {
                return collectionApi.create(user, id, parentId, node)
            })
            .then((result) => {
                // test the immediate result returns the node and edge
                expect(result).toMatchObject({
                    node: {
                        name: "wowzers",
                        id: id,
                        type: "collection",
                    },
                    edge: {
                        start: id,
                        end: parentId,
                        id: edgeId,
                    }
                })

                return getUserGraphData(db, userId)
            })
            .then((result) => {
                // test the final state is as expected
                // TODO: test final state is as expected

            })
        })

        test("Collection.connect() works properly", () => {
            const edgeId = uuidV4Actual()
            const sourceId = uuidV4Actual()
            const targetId = uuidV4Actual()

            return loadFixtures(db, userId.toString(), [
                {
                    labels: "Collection" ,
                    properties: {
                        "name": "Source collection",
                        "id": sourceId,
                        "type": "collection"
                    }
                },
                {
                    labels: "Collection" ,
                    properties: {
                        "name": "Target collection",
                        "id": targetId,
                        "type": "collection"
                    }
                },
            ])
            .then(() => getUserGraphData(db, userId))
            .then((data) => {
                return collectionApi.connect(user, sourceId, targetId, edgeId)
                .then((result) => {
                    return result
                })
            })
            .then((result) => {
                // expect result to return the edge
                expect(result).toMatchObject({
                    start: sourceId,
                    end: targetId,
                    id: edgeId,
                })

                return getUserGraphData(db, userId)
            })
            .then((graphState) => {
                // test if graph state is as expected
                expect(sortById(graphState.nodes)).toMatchObject(sortById([
                    {
                        name: 'Source collection',
                        type: 'collection',
                        id: sourceId,
                    },
                    {
                        name: 'Target collection',
                        type: 'collection',
                        id: targetId,
                    },
                    {
                        id: userId.toString(),
                    }
                ]))

                expect(sortById(graphState.edges)).toMatchObject(sortById([
                    {},
                    {
                        end: targetId,
                        start: sourceId,
                        id: edgeId,
                    }
                ]))
            })
        })
    })
