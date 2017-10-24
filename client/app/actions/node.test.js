import { createMockStore } from '../test/util'
import * as nodeActions from './node'

const uuidV4 = require('uuid/v4');
jest.mock('uuid/v4')
const uuidV4Actual = require.requireActual('uuid/v4');

import { WebSocket, Server, SocketIO } from 'mock-socket'
import io from 'socket.io-client'

let _socket, store, mockServer;

// TODO: should also test nodesByCollectionId state is set properly - 2017-09-20

describe('node actions', () => {
    beforeAll(() => {
        mockServer = new Server('foobar');
        _socket = SocketIO('foobar');

        return new Promise(resolve => {
            mockServer.on('connect', () => {
                resolve()
            })
        })
    })

    beforeEach(() => {
        store = createMockStore(_socket, {})
    })

    afterEach(() => {
        // TODO: remove all events - 2017-08-26
    })

    afterAll(() => {
        return new Promise(resolve => {
            mockServer.stop(resolve)
        })
    })


    /*
     * Tests the node actions and the reducer reacting on the state changes
     */
    test("Test createNode() action", () => {

        mockServer.on('Node.create', (id, data, res) => {
            res(null, {
                name: data.name,
                type: 'node',
                id: id,
                created: '1501582629992',
                modified: '1501582629992',
                collectionChains: [],
            })
        })

        const initialState = {}
        store = createMockStore(_socket, initialState)

        uuidV4.mockImplementationOnce(() => "TEST__Node")

        return store.dispatch(nodeActions.createNode({ name: "Node" }))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__Node"]: {
                                name: 'Node',
                                modified: '1501582629992',
                                id: "TEST__Node",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            }
                        }
                    }
                })
            })
    })

    test("Test updateNode() action", () => {
        const node = {
            name: 'Node',
            modified: '1501582629992',
            id: "TEST__Node",
            type: 'node',
            created: '1501582629992',
            collectionChains: [],
        }

        mockServer.on('Node.update', (id, data, res) => {
            res(null, { ...node, name: "Node_after" })
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__Node"]: node
                }
            }
        }
        store = createMockStore(_socket, initialState)

        return store.dispatch(nodeActions.updateNode("TEST__Node", { name: "Node_after" }))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__Node"]: {
                                name: 'Node_after',
                                modified: '1501582629992',
                                id: "TEST__Node",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            }
                        }
                    }
                })
            })
    })

    test("Test removeNode() action", () => {
        mockServer.on('Node.remove', (id, res) => {
            res(null, true)
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__Node"]: {
                        name: 'Node',
                        modified: '1501582629992',
                        id: "TEST__Node",
                        type: 'node',
                        created: '1501582629992',
                        collectionChains: [],
                    },
                    ["TEST__Node2"]: {
                        name: 'Node2',
                        modified: '1501582629992',
                        id: "TEST__Node2",
                        type: 'node',
                        created: '1501582629992',
                        collectionChains: [],
                    },
                },
                edges: {
                    ["TEST__Node_Node2"]: {
                        end: "TEST__Node2",
                        start: "TEST__Node",
                        id: "TEST__Node_Node2",
                    },
                    ["TEST__Node2_Node"]: {
                        start: "TEST__Node2",
                        end: "TEST__Node",
                        id: "TEST__Node2_Node",
                    }
                }
            },
            adjacencyMap: {
                "TEST__Node": [ "TEST__Node2" ],
                "TEST__Node2": [ "TEST__Node" ],
            },
            reverseAdjacencyMap: {
                "TEST__Node": [ "TEST__Node2" ],
                "TEST__Node2": [ "TEST__Node" ],
            },
            edgeListMap: {
                "TEST__Node": {
                    from: [ "TEST__Node_Node2" ],
                    to: [ "TEST__Node2_Node" ],
                },
                "TEST__Node2": {
                    from: [ "TEST__Node2_Node" ],
                    to: [ "TEST__Node_Node2" ],
                }
            }
        }
        store = createMockStore(_socket, initialState)

        return store.dispatch(nodeActions.removeNode("TEST__Node"))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__Node2"]: {
                                name: 'Node2',
                                modified: '1501582629992',
                                id: "TEST__Node2",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            },
                        },
                        edges: { }
                    },
                    adjacencyMap: {
                        "TEST__Node2": [],
                    },
                    reverseAdjacencyMap: {
                        "TEST__Node2": [],
                    },
                    edgeListMap: {
                        "TEST__Node2": {
                            from: [],
                            to: [],
                        }
                    }
                })
            })
    })

    test("Test connectNodes() action", () => {
        mockServer.on('Node.connect', (start, end, id, res) => {
            res(null, {
                start,
                end,
                id,
            })
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__Node"]: {
                        name: 'Node',
                        modified: '1501582629992',
                        id: "TEST__Node",
                        type: 'node',
                        created: '1501582629992',
                        collectionChains: [],
                    },
                    ["TEST__Node2"]: {
                        name: 'Node2',
                        modified: '1501582629992',
                        id: "TEST__Node2",
                        type: 'node',
                        created: '1501582629992',
                        collectionChains: [],
                    }
                }
            }
        }
        store = createMockStore(_socket, initialState)

        uuidV4.mockImplementationOnce(() => "TEST__Node_Node2")

        return store.dispatch(nodeActions.connectNodes("TEST__Node", "TEST__Node2"))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__Node"]: {
                                name: 'Node',
                                modified: '1501582629992',
                                id: "TEST__Node",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            },
                            ["TEST__Node2"]: {
                                name: 'Node2',
                                modified: '1501582629992',
                                id: "TEST__Node2",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            },
                        },
                        edges: {
                            ["TEST__Node_Node2"]: {
                                start: "TEST__Node",
                                end: "TEST__Node2",
                                id: "TEST__Node_Node2",
                            },
                        }
                    },
                    adjacencyMap: {
                        "TEST__Node": [ "TEST__Node2" ],
                    },
                    reverseAdjacencyMap: {
                        "TEST__Node2": [ "TEST__Node" ],
                    },
                    edgeListMap: {
                        "TEST__Node": {
                            from: [ "TEST__Node_Node2" ],
                            to: [],
                        },
                        "TEST__Node2": {
                            from: [],
                            to: [ "TEST__Node_Node2" ],
                        }
                    }
                })
            })
    })

    test('test addEdge() action', function() {
        // TODO: should be merged with connect() - 2017-08-28
        mockServer.on('Node.addEdge', (start, end, id, content, res) => {
            res(null, {
                start,
                end,
                id,
                content,
            })
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__Node"]: {
                        name: 'Node',
                        modified: '1501582629992',
                        id: "TEST__Node",
                        type: 'node',
                        created: '1501582629992',
                        collectionChains: [],
                    },
                    ["TEST__Node2"]: {
                        name: 'Node2',
                        modified: '1501582629992',
                        id: "TEST__Node2",
                        type: 'node',
                        created: '1501582629992',
                        collectionChains: [],
                    }
                }
            }
        }
        store = createMockStore(_socket, initialState)

        uuidV4.mockImplementationOnce(() => "TEST__Node_Node2")

        return store.dispatch(nodeActions.addEdge("TEST__Node", "TEST__Node2", "some content"))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__Node"]: {
                                name: 'Node',
                                modified: '1501582629992',
                                id: "TEST__Node",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            },
                            ["TEST__Node2"]: {
                                name: 'Node2',
                                modified: '1501582629992',
                                id: "TEST__Node2",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            },
                        },
                        edges: {
                            ["TEST__Node_Node2"]: {
                                start: "TEST__Node",
                                end: "TEST__Node2",
                                id: "TEST__Node_Node2",
                                content: "some content",
                            },
                        }
                    },
                    adjacencyMap: {
                        "TEST__Node": [ "TEST__Node2" ],
                    },
                    reverseAdjacencyMap: {
                        "TEST__Node2": [ "TEST__Node" ],
                    },
                    edgeListMap: {
                        "TEST__Node": {
                            from: [ "TEST__Node_Node2" ],
                            to: [],
                        },
                        "TEST__Node2": {
                            from: [],
                            to: [ "TEST__Node_Node2" ],
                        }
                    }
                })
            })
    })

    test("Test removeEdge() action", function() {
        mockServer.on('Node.removeEdge', (id, res) => {
            res(null, true)
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__Node"]: {
                        name: 'Node',
                        modified: '1501582629992',
                        id: "TEST__Node",
                        type: 'node',
                        created: '1501582629992',
                        collectionChains: [],
                    },
                    ["TEST__Node2"]: {
                        name: 'Node2',
                        modified: '1501582629992',
                        id: "TEST__Node2",
                        type: 'node',
                        created: '1501582629992',
                        collectionChains: [],
                    },
                },
                edges: {
                    ["TEST__Node_Node2"]: {
                        start: "TEST__Node",
                        end: "TEST__Node2",
                        id: "TEST__Node_Node2",
                    },
                }
            },
            adjacencyMap: {
                "TEST__Node": [ "TEST__Node2" ],
            },
            reverseAdjacencyMap: {
                "TEST__Node2": [ "TEST__Node" ],
            },
            edgeListMap: {
                "TEST__Node": {
                    from: [ "TEST__Node_Node2" ],
                    to: [],
                },
                "TEST__Node2": {
                    from: [],
                    to: [ "TEST__Node_Node2" ],
                }
            }
        }
        store = createMockStore(_socket, initialState)

        return store.dispatch(nodeActions.removeEdge("TEST__Node_Node2"))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__Node"]: {
                                name: 'Node',
                                modified: '1501582629992',
                                id: "TEST__Node",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            },
                            ["TEST__Node2"]: {
                                name: 'Node2',
                                modified: '1501582629992',
                                id: "TEST__Node2",
                                type: 'node',
                                created: '1501582629992',
                                collectionChains: [],
                            },
                        },
                        edges: { }
                    },
                    adjacencyMap: {
                        "TEST__Node": [],
                    },
                    reverseAdjacencyMap: {
                        "TEST__Node2": [],
                    },
                    edgeListMap: {
                        "TEST__Node": {
                            from: [],
                            to: [],
                        },
                        "TEST__Node2": {
                            from: [],
                            to: [],
                        }
                    }
                })
            })
    })
})

