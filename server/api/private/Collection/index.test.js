const neo4j = require('neo4j-driver').v1
const elasticsearch = require('elasticsearch')
const ObjectID = require('mongodb').ObjectID

const uuidV4 = require('uuid/v4');
jest.mock('uuid/v4')

const createCollectionApi = require('./index.js')
const config = require('../../../config/config.test.js')


const userId = new ObjectID()
const rootCollectionId = "__TEST__123456789"
// id is all the API needs to know
const user = {
    _id: userId,
}
let collectionApi, db, es;

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

    afterAll(() => {
        // cleanup
        db.run(`
            MATCH (u:User)-[*]-(n) WHERE u.id = ${userId}
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

        // return the collection created?
        // expect(result).toEqual()

        expect(graphState).toMatchObject({
            nodes: [{
                name: 'My Knowledge Base',
                // modified: '1503323527535',
                id: 'abc',
                nodes: [],
                type: 'root',
                isRootCollection: true,
                // created: '1503323527535'
            }],
            edges: [ {} ]
        })
    })

    test('test Collection.create()', async () => {
        // need to load test data
        const id = "abc"
        uuidV4.mockImplementationOnce(() => id)

        const result = await collectionApi.createRootCollection(user)
        const graphState = await getUserGraphData(db, userId)
    })
})
