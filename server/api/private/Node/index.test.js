const neo4j = require('neo4j-driver').v1
const elasticsearch = require('elasticsearch')
const ObjectID = require('mongodb').ObjectID

const uuidV4 = require('uuid/v4');
jest.mock('uuid/v4')
const uuidV4Actual = require.requireActual('uuid/v4');

const createNodeApi = require('./index.js')
const config = require('../../../config/test.config.js')

const {
    sortById,
    sortByStart,
    getUserGraphData,
    loadFixtures,
} = require('../../test/util')

const userId = new ObjectID()
const rootNodeId = "__TEST__123456789"
// id is all the API needs to know
const user = {
    _id: userId,
}
let nodeApi, db, es;


describe('nodeApi', () => {
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

        nodeApi = createNodeApi(db, es)
    })

    afterEach(() => {
        // cleanup
        db.run(`
                MATCH (u:User)-[*]-(n) WHERE u.id = "${userId.toString()}"
                DETACH DELETE u
                DETACH DELETE n
                `)
    })

    test("Node.create() should create a disconnected node", () => {

        const node = {
            name: "Node"
        }

        return loadFixtures(db, userId.toString())
            .then(() => {
                return nodeApi.create(user, "TEST__Node", node)
            })
            .then((result) => {
                // expect result to return the edge
                expect(result).toMatchObject({
                    name: 'Node',
                    type: 'node',
                    id: "TEST__Node",
                })

                return getUserGraphData(db, userId)
            })
            .then((graphState) => {
                // test if graph state is as expected
                expect(sortById(graphState.nodes)).toMatchObject(sortById([
                    {
                        properties: {
                            name: 'Node',
                            type: 'node',
                            id: "TEST__Node",
                        },
                        labels: [ 'Node' ]
                    }
                ]))

                expect(sortById(graphState.edges)).toMatchObject(sortById([
                    {
                        type: 'AUTHOR',
                        properties: {}
                    }
                ]))
            })
    })

    
})

