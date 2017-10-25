const neo4j = require('neo4j-driver').v1
const elasticsearch = require('elasticsearch')
const ObjectID = require('mongodb').ObjectID

const uuidV4 = require('uuid/v4');
jest.mock('uuid/v4')
const uuidV4Actual = require.requireActual('uuid/v4');

const createCollectionApi = require('./index.js')
const config = require('../../../config/test.config.js')

const {
    sortById,
    sortByStart,
    sortByIdFlat,
    getUserGraphData,
    loadFixtures,
} = require('../../test/util')

const userId = new ObjectID()
const rootCollectionId = "__TEST__123456789"
// id is all the API needs to know
const user = {
    _id: userId,
}
let collectionApi, db, es;


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
                DETACH DELETE u
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
            nodes: [
                {
                    properties: {
                        name: 'My Knowledge Base',
                        // modified: '1503323527535',
                        id: 'abc',
                        type: 'root',
                        isRootCollection: true,
                        // created: '1503323527535'
                    },
                    labels: [ 'RootCollection', 'Node', 'Collection' ]
                }
            ],
            edges: [
                {
                    type: 'AUTHOR',
                    properties: {}
                }
            ]
        })
    })

    test.skip("test Collection.getAll() returns all collections and their connections", function() {
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
            {
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection",
                    "id": "TEST__collection",
                    "type": "collection"
                }
            },
            {
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection2",
                    "id": "TEST__collection2",
                    "type": "collection"
                }
            },
            {
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection3",
                    "id": "TEST__collection3",
                    "type": "collection"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node",
                    "id": "TEST__node",
                    "type": "node"
                }
            },
        ], [
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__collection",
                    id: "TEST__collection_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__collection",
                    start: "TEST__collection2",
                    id: "TEST__collection2_collection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__collection2",
                    start: "TEST__node",
                    id: "TEST__node_collection2",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__collection3",
                    id: "TEST__node3_collection",
                },
                type: "AbstractEdge"
            },
        ])
            .then(() => {
                return collectionApi.getAll(user)
            })
            .then((result) => {
                expect(sortByIdFlat(result.collections)).toMatchObject(
                    sortByIdFlat([
                        {
                            collections: [],
                            name: 'My Knowledge Base',
                            isRootCollection: true,
                            id: 'TEST__rootCollection',
                            type: 'root',
                            count: 4
                        },
                        {
                            collections: [ "TEST__rootCollection" ],
                            type: 'collection',
                            name: 'Collection3',
                            id: 'TEST__collection3',
                            count: 0
                        },
                        {
                            collections: [ "TEST__collection" ],
                            type: 'collection',
                            name: 'Collection2',
                            id: 'TEST__collection2',
                            count: 1
                        },
                        {
                            collections: [ "TEST__rootCollection" ],
                            type: 'collection',
                            name: 'Collection',
                            id: 'TEST__collection',
                            count: 2
                        },
                        {
                            collections: [ "TEST__collection2" ],
                            count: 0,
                            type: 'node',
                            name: 'Node',
                            id: 'TEST__node',
                        }
                    ])
                )


                expect(sortByIdFlat(result.edges)).toMatchObject(
                    sortByIdFlat([
                        {
                            end: 'TEST__rootCollection',
                            start: 'TEST__collection',
                            id: 'TEST__collection_rootCollection'
                        },
                        {
                            end: 'TEST__collection',
                            start: 'TEST__collection2',
                            id: 'TEST__collection2_collection'
                        },
                        {
                            end: 'TEST__rootCollection',
                            start: 'TEST__collection3',
                            id: 'TEST__node3_collection'
                        },
                        {
                            end: 'TEST__collection2',
                            start: 'TEST__node',
                            id: 'TEST__node_collection2'
                        }
                    ])
                )
            })
    })

    test.skip("test Collection.get() returns the collection and the direct children with their collections[]", function() {

    })

    test("test Collection.getL1() returns the collection, direct children and their neighbours and their collections[]", function() {
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
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection",
                    "id": "TEST__collection",
                    "type": "collection"
                }
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
                    "name": "Node2",
                    "id": "TEST__node2",
                    "type": "node"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node3",
                    "id": "TEST__node3",
                    "type": "node"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node4",
                    "id": "TEST__node4",
                    "type": "node"
                }
            }
        ], [
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__collection",
                    id: "TEST__collection_rootCollection",
                },
                type: "AbstractEdge"
            },
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
                    start: "TEST__node4",
                    id: "TEST__node4_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__collection",
                    start: "TEST__node2",
                    id: "TEST__node2_collection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__collection",
                    start: "TEST__node3",
                    id: "TEST__node3_collection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__node",
                    start: "TEST__node3",
                    id: "TEST__node3_node",
                },
                type: "EDGE"
            },
        ])
            .then(() => {
                return collectionApi.getL1(user, "TEST__collection")
            })
            .then((result) => {
                expect(result).toEqual(
                    {
                        nodes: [
                            { 
                                type: 'collection',
                                name: 'Collection',
                                id: 'TEST__collection',
                                collections: [ 
                                    'TEST__rootCollection'
                                ],
                                count: 2 
                            },
                            {
                                    id: 'TEST__node',
                                    type: 'node',
                                    name: 'Node',
                                    collections: [
                                        'TEST__rootCollection'
                                    ],
                                    count: 0
                            },
                            {
                                name: 'Node2',
                                id: 'TEST__node2',
                                type: 'node',
                                collections: [
                                    'TEST__collection'
                                ],
                                count: 0
                            },
                            {
                                name: 'Node3',
                                id: 'TEST__node3',
                                type: 'node',
                                collections: [
                                    'TEST__collection'
                                ],
                                count: 0
                            },
                        ],
                        edges: [
                            {
                                start: 'TEST__node3',
                                end: 'TEST__node',
                                id: 'TEST__node3_node'
                            }]
                    }
                )
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
                labels: [ "Collection", "RootCollection" ],
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
                    name: "wowzers",
                    id: id,
                    type: "collection",
                })

                return getUserGraphData(db, userId)
            })
            .then((result) => {
                // test the final state is as expected
                // TODO: test final state is as expected
            })
    })

    test("Impossible to remove RootCollection", () => {
        return loadFixtures(db, userId.toString(), [
            {
                properties: {
                    name: 'My Knowledge Base',
                    id: 'TEST__rootCollection',
                    type: 'root',
                    isRootCollection: true,
                },
                labels: [ 'RootCollection', 'Collection', 'Node' ]
            },
        ])
            .then(() => {
                return collectionApi.remove(user, "TEST__rootCollection")
            })
            .then((result) => {
                return getUserGraphData(db, userId)
            })
            .then((graphState) => {
                // console.log(require('util').inspect(graphState, false, null))
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

                expect(sortById(graphState.edges)).toMatchObject(sortById([
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                ]))
            })
    })

    test("Collection.remove() converts the abstraction to a node", () => {

        return loadFixtures(db, userId.toString(), [
            {
                properties: {
                    name: 'My Knowledge Base',
                    id: 'TEST__rootCollection',
                    type: 'root',
                    isRootCollection: true,
                },
                labels: [ 'RootCollection', 'Node', 'Collection' ]
            },
            {
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection",
                    "id": "TEST__collection",
                    "type": "collection"
                }
            }
        ], [
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__collection",
                    id: "TEST__collection_rootCollection",
                },
                type: "AbstractEdge"
            }
        ])
            .then(() => {
                return collectionApi.remove(user, "TEST__collection")
            })
            .then((result) => {
                // expect result to return true
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
                    {
                        labels: [ "Node" ], // this was removed
                        properties: {
                            "name": "Collection",
                            "id": "TEST__collection",
                            "type": "node"
                        }
                    },
                    {
                        properties: {
                            id: userId.toString(),
                        },
                        labels: [ 'User' ]
                    }
                ], [
                    {
                        properties: {
                            end: "TEST__rootCollection",
                            start: "TEST__collection",
                            id: "TEST__collection_rootCollection",
                        },
                        type: "AbstractEdge"
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
                            start: "TEST__collection",
                            id: "TEST__collection_rootCollection",
                        },
                        type: "AbstractEdge"
                    }
                ]))
            })


    })

    test("Collection.remove() removes the collection and attaches the child nodes to the parent collection", () => {
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
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection",
                    "id": "TEST__collection",
                    "type": "collection"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node1",
                    "id": "TEST__node1",
                    "type": "node"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node2",
                    "id": "TEST__node2",
                    "type": "node"
                }
            },
        ], [
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__collection",
                    id: "TEST__collection_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__collection",
                    start: "TEST__node1",
                    id: "TEST__node1_collection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__collection",
                    start: "TEST__node2",
                    id: "TEST__node2_collection",
                },
                type: "AbstractEdge"
            },
        ])
            .then(() => {
                return collectionApi.remove(user, "TEST__collection")
            })
            .then((result) => {
                // expect result to return true
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
                        labels: [ "Node" ], // this was removed
                        properties: {
                            "name": "Collection",
                            "id": "TEST__collection",
                            "type": "node"
                        }
                    },
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Node1",
                            "id": "TEST__node1",
                            "type": "node"
                        }
                    },
                    {
                        labels: [ "Node" ],
                        properties: {
                            "name": "Node2",
                            "id": "TEST__node2",
                            "type": "node"
                        }
                    },
                    {
                        properties: {
                            id: userId.toString(),
                        },
                        labels: [ 'User' ]
                    }
                ]))

                // TODO: need to know the id for the edge, but is created in neo4j
                expect(sortByStart(graphState.edges)).toMatchObject(sortByStart([
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        type: 'AUTHOR',
                        properties: {}
                    },
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
                            start: "TEST__collection",
                            id: "TEST__collection_rootCollection",
                        },
                        type: "AbstractEdge"
                    },
                    {
                        properties: {
                            end: "TEST__rootCollection",
                            start: "TEST__node1",
                        },
                        type: "AbstractEdge"
                    },
                    {
                        properties: {
                            end: "TEST__rootCollection",
                            start: "TEST__node2",
                        },
                        type: "AbstractEdge"
                    },
                ]))
            })
    })


    test("test Collection.addNode() correctly called", () => {
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
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection",
                    "id": "TEST__collection",
                    "type": "collection"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node",
                    "id": "TEST__node",
                    "type": "node"
                }
            }
        ], [
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__collection",
                    id: "TEST__collection_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__node",
                    id: "TEST__node_rootCollection",
                },
                type: "AbstractEdge"
            },

        ])
            .then(() => {
                return collectionApi.addNode(user, "TEST__collection", "TEST__node", "TEST__node_collection")
            })
            .then((result) => {
                // expect result to return true
                expect(result).toMatchObject({
                    start: "TEST__node",
                    end: "TEST__collection",
                    id: "TEST__node_collection",
                })
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
                        labels: [ "Collection", "Node" ],
                        properties: {
                            "name": "Collection",
                            "id": "TEST__collection",
                            "type": "collection"
                        }
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
                        properties: {
                            id: userId.toString(),
                        },
                        labels: [ 'User' ]
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
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        properties: {
                            end: "TEST__rootCollection",
                            start: "TEST__collection",
                            id: "TEST__collection_rootCollection",
                        },
                        type: "AbstractEdge"
                    },
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
                            end: "TEST__collection",
                            start: "TEST__node",
                            id: "TEST__node_collection",
                        },
                        type: "AbstractEdge"
                    },
                ]))
            })
    })

    test("test Collection.addNode() no duplicates in path to parent (no loops)", function() {
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
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection",
                    "id": "TEST__collection",
                    "type": "collection"
                }
            },
            {
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection2",
                    "id": "TEST__collection2",
                    "type": "collection"
                }
            }
        ], [
            {
                properties: {
                    start: "TEST__collection",
                    end: "TEST__rootCollection",
                    id: "TEST__collection_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    start: "TEST__collection2",
                    end: "TEST__collection",
                    id: "TEST__collection2_collection",
                },
                type: "AbstractEdge"
            },
        ])
            .then(() => {
                return collectionApi.addNode(user, "TEST__collection2", "TEST__collection", "TEST__collection_collection2")
            })
            .then((result) => {
                // expect result to return true
                expect(result).toBe( "Loop in path to root abstraction")
                return getUserGraphData(db, userId)
            })
    })


    test("test Collection.removeNode() correctly called", () => {
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
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection",
                    "id": "TEST__collection",
                    "type": "collection"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node",
                    "id": "TEST__node",
                    "type": "node"
                }
            }
        ], [
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__collection",
                    id: "TEST__collection_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__collection",
                    start: "TEST__node",
                    id: "TEST__node_collection",
                },
                type: "AbstractEdge"
            },

        ])
            .then(() => {
                return collectionApi.removeNode(user, "TEST__collection", "TEST__node")
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
                        labels: [ "Collection", "Node" ],
                        properties: {
                            "name": "Collection",
                            "id": "TEST__collection",
                            "type": "collection"
                        }
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
                        properties: {
                            id: userId.toString(),
                        },
                        labels: [ 'User' ]
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
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        properties: {
                            end: "TEST__rootCollection",
                            start: "TEST__collection",
                            id: "TEST__collection_rootCollection",
                        },
                        type: "AbstractEdge"
                    },
                ]))
            })
    })

    test("Collection.moveNode() should move the node from the source collection to the target collection", () => {
        return loadFixtures(db, userId.toString(), [
            {
                properties: {
                    name: 'My Knowledge Base',
                    id: 'TEST__rootCollection',
                    type: 'root',
                    isRootCollection: true,
                },
                labels: [ 'RootCollection', 'Collection', 'Node' ]
            },
            {
                labels: [ "Collection", "Node" ],
                properties: {
                    "name": "Collection",
                    "id": "TEST__collection",
                    "type": "collection"
                }
            },
            {
                labels: [ "Node" ],
                properties: {
                    "name": "Node",
                    "id": "TEST__node",
                    "type": "node"
                }
            }
        ], [
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__collection",
                    id: "TEST__collection_rootCollection",
                },
                type: "AbstractEdge"
            },
            {
                properties: {
                    end: "TEST__rootCollection",
                    start: "TEST__node",
                    id: "TEST__node_rootCollection",
                },
                type: "AbstractEdge"
            },

        ])
            .then(() => {
                return collectionApi.moveNode(user,
                    "TEST__rootCollection",
                    "TEST__node",
                    "TEST__collection",
                    "TEST__node_collection",
                )
            })
            .then((result) => {
                // expect result to return true
                expect(result).toMatchObject({
                    start: "TEST__node",
                    end: "TEST__collection",
                    id: "TEST__node_collection",
                })
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
                    {
                        labels: [ "Collection", "Node" ],
                        properties: {
                            "name": "Collection",
                            "id": "TEST__collection",
                            "type": "collection"
                        }
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
                        properties: {
                            id: userId.toString(),
                        },
                        labels: [ 'User' ]
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
                        type: 'AUTHOR',
                        properties: {}
                    },
                    {
                        properties: {
                            end: "TEST__rootCollection",
                            start: "TEST__collection",
                            id: "TEST__collection_rootCollection",
                        },
                        type: "AbstractEdge"
                    },
                    {
                        properties: {
                            end: "TEST__collection",
                            start: "TEST__node",
                            id: "TEST__node_collection",
                        },
                        type: "AbstractEdge"
                    },
                ]))
            })
    })
})
