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

    test.skip("Node.get() returns the node and its collections[]", function() {

    })

    test.skip("Node.getL1() returns the node, its neighbours and their collections[]", function() {

    })

    test.skip("Node.getL2() returns the node, its neighbours up to two levels and their collections[]", function() {

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

    test("Node.update test nodes properties get updated", () => {

        const updatedNode = {
            "name": "Node after",
            "cantSetThis": "cantSetThis",
        }

        return loadFixtures(db, userId.toString(), [
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node before",
                    "id": "TEST__Node",
                    "type": "node"
                }
            }

        ])
            .then(() => {
                return nodeApi.update(user, "TEST__Node", updatedNode)
            })
            .then((result) => {
                // expect result to return the edge
                expect(result).toMatchObject({
                    name: 'Node after',
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
                            name: 'Node after',
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

    test("Node.remove() should remove the node and any associated edges", function() {
        return loadFixtures(db, userId.toString(), [
            {
                properties: {
                    name: 'My Knowledge Base',
                    id: 'TEST__rootCollection',
                    type: 'root',
                    isRootCollection: true,
                },
                labels: [ 'RootCollection', 'Collection' ]
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node",
                    "id": "TEST__node",
                    "type": "node"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Other Node",
                    "id": "TEST__node2",
                    "type": "node"
                }
            },
        ], [
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__node",
                    id: "TEST__node_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__node2",
                    id: "TEST__node2_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__node2",
                    start: "TEST__node",
                    id: "TEST__node_node2",
                },
                type: "EDGE"
            },

        ])
            .then(() => {
                return nodeApi.remove(user, "TEST__node")
            })
            .then((result) => {
                expect(result).toBe(true)
                return getUserGraphData(db, userId)
            })
            .then((graphState) => {
                // TODO: instead compare using the original object
                expect(sortById(graphState.nodes)).toMatchObject(sortById([
                    {
                        properties: {
                            name: 'My Knowledge Base',
                            id: 'TEST__rootCollection',
                            type: 'root',
                            isRootCollection: true,
                        },
                        labels: [ 'RootCollection', 'Collection' ]
                    },
                    {
                        properties: {
                            id: userId.toString(),
                        },
                        labels: [ 'User' ]
                    },
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Other Node",
                            "id": "TEST__node2",
                            "type": "node"
                        }
                    }
                ]))

                expect(sortById(graphState.edges)).toMatchObject(sortById([
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        properties: {
                            end: "TEST__rootCollection",
                            start: "TEST__node2",
                            id: "TEST__node2_rootCollection",
                        },
                        type: "AbstractEdge"
                    },
                ]))
            })
    })


    test("Node.remove() can't remove the root collection", function() {
        return loadFixtures(db, userId.toString(), [
            {
                properties: {
                    name: 'My Knowledge Base',
                    id: 'TEST__rootCollection',
                    type: 'root',
                    isRootCollection: true,
                },
                labels: [ 'Node', 'RootCollection', 'Collection' ]
            },
        ])
            .then(() => {
                return nodeApi.remove(user, "TEST__rootCollection")
            })
            .then((result) => {
                expect(result).toBe(true)
                return getUserGraphData(db, userId)
            })
            .then((graphState) => {
                // TODO: instead compare using the original object
                expect(sortById(graphState.nodes)).toMatchObject(sortById([
                    {
                        properties: {
                            name: 'My Knowledge Base',
                            id: 'TEST__rootCollection',
                            type: 'root',
                            isRootCollection: true,
                        },
                        labels: [ 'RootCollection', 'Node', 'Collection' ]
                    },
                ]))
            })
    })

    test("Test Node.connect() creates an edge between the two nodes", function() {
        return loadFixtures(db, userId.toString(), [
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node",
                    "id": "TEST__node",
                    "type": "node"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Other Node",
                    "id": "TEST__node2",
                    "type": "node"
                }
            },
        ])
            .then(() => {
                return nodeApi.connect(user,"TEST__node", "TEST__node2", "TEST__node_node2")
            })
            .then((result) => {
                expect(result).toMatchObject({
                    end: "TEST__node2",
                    start: "TEST__node",
                    id: "TEST__node_node2",
                })

                return getUserGraphData(db, userId)
            })
            .then((graphState) => {
                // TODO: instead compare using the original object
                expect(sortById(graphState.nodes)).toMatchObject(sortById([
                    {
                        properties: {
                            id: userId.toString(),
                        },
                        labels: [ 'User' ]
                    },
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Node",
                            "id": "TEST__node",
                            "type": "node"
                        }
                    },
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Other Node",
                            "id": "TEST__node2",
                            "type": "node"
                        }
                    },
                ]))

                expect(sortById(graphState.edges)).toMatchObject(sortById([
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        properties: {
                            end: "TEST__node2",
                            start: "TEST__node",
                            id: "TEST__node_node2",
                        },
                        type: "EDGE"
                    },
                ]))
            })
    })

    test("Test Node.addEdge(n1, n2) adds a detailed edged from n1 to n2", function() {
        return loadFixtures(db, userId.toString(), [
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node",
                    "id": "TEST__node",
                    "type": "node"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Other Node",
                    "id": "TEST__node2",
                    "type": "node"
                }
            },
        ])
            .then(() => {
                return nodeApi.addEdge(user,"TEST__node", "TEST__node2", "TEST__node_node2", "some text")
            })
            .then((result) => {
                expect(result).toMatchObject({
                    end: "TEST__node2",
                    start: "TEST__node",
                    id: "TEST__node_node2",
                    content: "some text"
                })

                return getUserGraphData(db, userId)
            })
            .then((graphState) => {
                // TODO: instead compare using the original object
                expect(sortById(graphState.nodes)).toMatchObject(sortById([
                    {
                        properties: {
                            id: userId.toString(),
                        },
                        labels: [ 'User' ]
                    },
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Node",
                            "id": "TEST__node",
                            "type": "node"
                        }
                    },
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Other Node",
                            "id": "TEST__node2",
                            "type": "node"
                        }
                    },
                ]))

                expect(sortById(graphState.edges)).toMatchObject(sortById([
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        properties: {
                            end: "TEST__node2",
                            start: "TEST__node",
                            id: "TEST__node_node2",
                            content: "some text",
                        },
                        type: "EDGE"
                    },
                ]))
            })

    })

    test("Test Node.removeEdge(id) succesfully removes the single edge with id ${id}", function() {
        return loadFixtures(db, userId.toString(), [
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node",
                    "id": "TEST__node",
                    "type": "node"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Other Node",
                    "id": "TEST__node2",
                    "type": "node"
                }
            },
        ], [
            {
                properties: {
                    start: "TEST__node",
                    end: "TEST__node2",
                    id: "TEST__node_node2",
                },
                type: "EDGE"
            },

        ])
            .then(() => {
                return nodeApi.removeEdge(user, "TEST__node_node2")
            })
            .then((result) => {
                expect(result).toBe(true)

                return getUserGraphData(db, userId)
            })
            .then((graphState) => {
                // TODO: instead compare using the original object
                expect(sortById(graphState.nodes)).toMatchObject(sortById([
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Node",
                            "id": "TEST__node",
                            "type": "node"
                        }
                    },
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Other Node",
                            "id": "TEST__node2",
                            "type": "node"
                        }
                    },
                ]))

                expect(sortById(graphState.edges)).toMatchObject(sortById([
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                ]))
            })
    })
})

