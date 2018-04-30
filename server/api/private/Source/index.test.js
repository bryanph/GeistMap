const neo4j = require('@bryanph/neo4j-driver').v1
const elasticsearch = require('elasticsearch')
const ObjectID = require('mongodb').ObjectID

const uuidV4 = require('uuid/v4');
jest.mock('uuid/v4')
const uuidV4Actual = require.requireActual('uuid/v4');

const createSourceApi = require('./index.js')
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
let sourceApi, db, es;


describe('sourceApi', () => {
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

        sourceApi = createSourceApi(db, es)
    })

    afterEach(() => {
        // cleanup
        db.run(`
                MATCH (u:User)-[*]-(n) WHERE u.id = "${userId.toString()}"
                DETACH DELETE u
                DETACH DELETE n
                `)
    })

    test("Source.getAll() should return all sources", () => {

        return loadFixtures(db, userId.toString(), [
            {
                properties: {
                    id: "TEST__source1",
                    name: "source1",
                    type: "pdf",
                    url: "https://bitcoin.org/bitcoin.pdf",
                },
                labels: [ "Source" ]
            },
            {
                properties: {
                    id: "TEST__source2",
                    name: "source2",
                    type: "pdf",
                    url: "https://bitcoin.org/bitcoin.pdf",
                },
                labels: [ "Source" ]
            },
            {
                properties: {
                    id: "TEST__source3",
                    name: "source3",
                    type: "pdf",
                    url: "https://bitcoin.org/bitcoin.pdf",
                },
                labels: [ "Source" ]
            },
        ])
            .then(() => {
                return sourceApi.getAll(user)
            })
            .then((result) => {
                // expect result to return the edge
                expect(result).toMatchObject([
                    {
                        id: "TEST__source1",
                        name: "source1",
                        type: "pdf",
                        url: "https://bitcoin.org/bitcoin.pdf",
                    },
                    {
                        id: "TEST__source2",
                        name: "source2",
                        type: "pdf",
                        url: "https://bitcoin.org/bitcoin.pdf",
                    },
                    {
                        id: "TEST__source3",
                        name: "source3",
                        type: "pdf",
                        url: "https://bitcoin.org/bitcoin.pdf",
                    }
                ])

                return getUserGraphData(db, userId)
            })
    })

    test("Source.get() should return the source with its annotations")

})


