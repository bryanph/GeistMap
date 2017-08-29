import { createMockStore } from '../test/util'
import * as collectionActions from './collection'

const uuidV4 = require('uuid/v4');
jest.mock('uuid/v4')
const uuidV4Actual = require.requireActual('uuid/v4');

import { WebSocket, Server, SocketIO } from 'mock-socket'
import io from 'socket.io-client'

let _socket, store, mockServer;

describe('collection actions', () => {
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
        mockServer.listeners = {}
    })

    afterAll(() => {
        return new Promise(resolve => {
            mockServer.stop(resolve)
        })
    })


    /*
     * Tests the node actions and the reducer reacting on the state changes
     */
    test("Test createCollection() action", () => {
        mockServer.on('Collection.create', (id, parentId, data, res) => {
            res(null, {
                "created": 1503389225848,
                "name": "Collection",
                "modified": 1503389225848,
                "id": "TEST__Collection",
                "type": "collection",
            })
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__RootCollection"]: {
                        "isRootCollection": true,
                        "created": 1503389225848,
                        "name": "My Knowledge Base",
                        "modified": 1503389225848,
                        "id": "TEST__RootCollection",
                        "type": "root"
                    },
                },
            },
        }

        store = createMockStore(_socket, initialState)

        return store.dispatch(collectionActions.createCollection("TEST__Collection", "TEST__RootCollection", { "name": "Collection" }))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            "TEST__RootCollection": {
                                "isRootCollection": true,
                                "created": 1503389225848,
                                "name": "My Knowledge Base",
                                "modified": 1503389225848,
                                "id": "TEST__RootCollection",
                                "type": "root",
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "type": "collection",
                                "collectionChains": [
                                    [ "TEST__RootCollection" ]
                                ]
                            },
                        },
                    },
                })
            })
    })

    test("Test removeCollection action", function() {
        // TODO: test more cases - 2017-08-29
        mockServer.on('Collection.remove', (id, res) => {
            res(null, true)
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__RootCollection"]: {
                        "isRootCollection": true,
                        "created": 1503389225848,
                        "name": "My Knowledge Base",
                        "modified": 1503389225848,
                        "id": "TEST__RootCollection",
                        "type": "root",
                        "collectionChains": [
                        ]
                    },
                    "TEST__Collection": {
                        "created": 1503389225848,
                        "name": "Collection",
                        "modified": 1503389225848,
                        "id": "TEST__Collection",
                        "type": "collection",
                        "collectionChains": [
                            [ "TEST__RootCollection" ]
                        ]
                    },
                    "TEST__Collection_child": {
                        "created": 1503389225848,
                        "name": "Collection_child",
                        "modified": 1503389225848,
                        "id": "TEST__Collection_child",
                        "type": "collection",
                        "collectionChains": [
                            [ "TEST__RootCollection", "TEST__Collection" ],
                            [ "TEST__RootCollection" ],
                        ]
                    },
                    "TEST__Node_child": {
                        "created": 1503389225848,
                        "name": "Node_child",
                        "modified": 1503389225848,
                        "id": "TEST__Node_child",
                        "type": "node",
                        "collectionChains": [
                            [ "TEST__RootCollection", "TEST__Collection", "TEST__Collection_child" ],
                            [ "TEST__RootCollection", "TEST__Collection" ],
                        ]
                    },
                },
            },
        }

        store = createMockStore(_socket, initialState)

        return store.dispatch(collectionActions.fetchRemoveAbstraction("TEST__Collection_child"))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__RootCollection"]: {
                                "isRootCollection": true,
                                "created": 1503389225848,
                                "name": "My Knowledge Base",
                                "modified": 1503389225848,
                                "id": "TEST__RootCollection",
                                "type": "root",
                                "collectionChains": [ ]
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "type": "collection",
                                "collectionChains": [
                                    [ "TEST__RootCollection" ]
                                ]
                            },
                            "TEST__Collection_child": {
                                "created": 1503389225848,
                                "name": "Collection_child",
                                "modified": 1503389225848,
                                "id": "TEST__Collection_child",
                                "type": "node",
                                "collectionChains": [
                                    [ "TEST__RootCollection", "TEST__Collection" ],
                                    [ "TEST__RootCollection" ],
                                ]
                            },
                            "TEST__Node_child": {
                                "created": 1503389225848,
                                "name": "Node_child",
                                "modified": 1503389225848,
                                "id": "TEST__Node_child",
                                "type": "node",
                                "collectionChains": [
                                    [ "TEST__RootCollection", "TEST__Collection"],
                                ]
                            },
                        },
                    },
                })
            })
    })


    test("Test addNodeToCollection() action", function() {
        // TODO: test more cases - 2017-08-29
        mockServer.on('Collection.addNode', (collectionId, nodeId, id, res) => {
            res(null, true)
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__RootCollection"]: {
                        "isRootCollection": true,
                        "created": 1503389225848,
                        "name": "My Knowledge Base",
                        "modified": 1503389225848,
                        "id": "TEST__RootCollection",
                        "type": "root",
                        "collectionChains": [
                        ]
                    },
                    "TEST__Collection": {
                        "created": 1503389225848,
                        "name": "Collection",
                        "modified": 1503389225848,
                        "id": "TEST__Collection",
                        "type": "collection",
                        "collectionChains": [
                            [ "TEST__RootCollection" ]
                        ]
                    },
                    "TEST__Collection_child": {
                        "created": 1503389225848,
                        "name": "Collection_child",
                        "modified": 1503389225848,
                        "id": "TEST__Collection_child",
                        "type": "collection",
                        "collectionChains": [
                            [ "TEST__RootCollection", "TEST__Collection" ],
                            [ "TEST__RootCollection" ],
                        ]
                    },
                    "TEST__Node_child": {
                        "created": 1503389225848,
                        "name": "Node_child",
                        "modified": 1503389225848,
                        "id": "TEST__Node_child",
                        "type": "node",
                        "collectionChains": [ ]
                    },
                },
            },
        }

        store = createMockStore(_socket, initialState)

        return store.dispatch(collectionActions.addNodeToCollection("TEST__Collection_child", "TEST__Node_child"))
            .then((action) => {
                // console.log(require('util').inspect(store.getState(), false, null))
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__RootCollection"]: {
                                "isRootCollection": true,
                                "created": 1503389225848,
                                "name": "My Knowledge Base",
                                "modified": 1503389225848,
                                "id": "TEST__RootCollection",
                                "type": "root",
                                "collectionChains": [
                                ]
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "type": "collection",
                                "collectionChains": [
                                    [ "TEST__RootCollection" ]
                                ]
                            },
                            "TEST__Collection_child": {
                                "created": 1503389225848,
                                "name": "Collection_child",
                                "modified": 1503389225848,
                                "id": "TEST__Collection_child",
                                "type": "collection",
                                "collectionChains": [
                                    [ "TEST__RootCollection", "TEST__Collection" ],
                                    [ "TEST__RootCollection" ],
                                ]
                            },
                            "TEST__Node_child": {
                                "created": 1503389225848,
                                "name": "Node_child",
                                "modified": 1503389225848,
                                "id": "TEST__Node_child",
                                "type": "node",
                                "collectionChains": [
                                    [ "TEST__RootCollection", "TEST__Collection", "TEST__Collection_child" ],
                                    [ "TEST__RootCollection", "TEST__Collection_child" ],
                                ]
                            },
                        },
                    },
                })
            })
    })

    test("Test removeNodeFromCollection() action", function() {
        // TODO: test more cases - 2017-08-29
        mockServer.on('Collection.removeNode', (collectionId, nodeId, res) => {

            res(null, true)
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__RootCollection"]: {
                        "isRootCollection": true,
                        "created": 1503389225848,
                        "name": "My Knowledge Base",
                        "modified": 1503389225848,
                        "id": "TEST__RootCollection",
                        "type": "root",
                        "collectionChains": [
                        ]
                    },
                    "TEST__Collection": {
                        "created": 1503389225848,
                        "name": "Collection",
                        "modified": 1503389225848,
                        "id": "TEST__Collection",
                        "type": "collection",
                        "collectionChains": [
                            [ "TEST__RootCollection" ]
                        ]
                    },
                    "TEST__Collection_child": {
                        "created": 1503389225848,
                        "name": "Collection_child",
                        "modified": 1503389225848,
                        "id": "TEST__Collection_child",
                        "type": "collection",
                        "collectionChains": [
                            [ "TEST__RootCollection", "TEST__Collection" ],
                            [ "TEST__RootCollection" ],
                        ]
                    },
                    "TEST__Node_child": {
                        "created": 1503389225848,
                        "name": "Node_child",
                        "modified": 1503389225848,
                        "id": "TEST__Node_child",
                        "type": "node",
                        "collectionChains": [
                            [ "TEST__RootCollection", "TEST__Collection", "TEST__Collection_child" ],
                            [ "TEST__RootCollection", "TEST__Collection_child" ],
                        ]
                    },
                },
            },
        }

        store = createMockStore(_socket, initialState)

        return store.dispatch(collectionActions.removeNodeFromCollection("TEST__Collection_child", "TEST__Node_child"))
            .then((action) => {
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__RootCollection"]: {
                                "isRootCollection": true,
                                "created": 1503389225848,
                                "name": "My Knowledge Base",
                                "modified": 1503389225848,
                                "id": "TEST__RootCollection",
                                "type": "root",
                                "collectionChains": [
                                ]
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "type": "collection",
                                "collectionChains": [
                                    [ "TEST__RootCollection" ]
                                ]
                            },
                            "TEST__Collection_child": {
                                "created": 1503389225848,
                                "name": "Collection_child",
                                "modified": 1503389225848,
                                "id": "TEST__Collection_child",
                                "type": "collection",
                                "collectionChains": [
                                    [ "TEST__RootCollection", "TEST__Collection" ],
                                    [ "TEST__RootCollection" ],
                                ]
                            },
                            "TEST__Node_child": {
                                "created": 1503389225848,
                                "name": "Node_child",
                                "modified": 1503389225848,
                                "id": "TEST__Node_child",
                                "type": "node",
                                "collectionChains": [
                                ]
                            },
                        },
                    },
                })
            })
    })

    test("Test moveToAbstraction() action move node to collection", function() {
        /*
         * move a node to an abstraction without conversion
         */
        mockServer.on('Collection.moveNode', (sourceCollectionId, sourceId, targetId, edgeId, res) => {
            res(null, true)
        })

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__RootCollection"]: {
                        "isRootCollection": true,
                        "created": 1503389225848,
                        "name": "My Knowledge Base",
                        "modified": 1503389225848,
                        "id": "TEST__RootCollection",
                        "type": "root",
                        "collectionChains": [
                        ]
                    },
                    "TEST__Collection": {
                        "created": 1503389225848,
                        "name": "Collection",
                        "modified": 1503389225848,
                        "id": "TEST__Collection",
                        "type": "collection",
                        "collectionChains": [
                            [ "TEST__RootCollection" ]
                        ]
                    },
                    "TEST__Collection_child": {
                        "created": 1503389225848,
                        "name": "Collection_child",
                        "modified": 1503389225848,
                        "id": "TEST__Collection_child",
                        "type": "collection",
                        "collectionChains": [
                            [ "TEST__RootCollection", "TEST__Collection" ],
                            [ "TEST__RootCollection" ],
                        ]
                    },
                    "TEST__Node_child": {
                        "created": 1503389225848,
                        "name": "Node_child",
                        "modified": 1503389225848,
                        "id": "TEST__Node_child",
                        "type": "node",
                        "collectionChains": [
                            [ "TEST__RootCollection" ],
                        ]
                    },
                },
            },
        }

        store = createMockStore(_socket, initialState)

        return store.dispatch(collectionActions.moveToAbstraction("TEST__RootCollection", "TEST__Node_child", "TEST__Collection_child"))
            .then((action) => {
                expect(store.getState()).toMatchObject({
                    entities: {
                        nodes: {
                            ["TEST__RootCollection"]: {
                                "isRootCollection": true,
                                "created": 1503389225848,
                                "name": "My Knowledge Base",
                                "modified": 1503389225848,
                                "id": "TEST__RootCollection",
                                "type": "root",
                                "collectionChains": [
                                ]
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "type": "collection",
                                "collectionChains": [
                                    [ "TEST__RootCollection" ]
                                ]
                            },
                            "TEST__Collection_child": {
                                "created": 1503389225848,
                                "name": "Collection_child",
                                "modified": 1503389225848,
                                "id": "TEST__Collection_child",
                                "type": "collection",
                                "collectionChains": [
                                    [ "TEST__RootCollection", "TEST__Collection" ],
                                    [ "TEST__RootCollection" ],
                                ]
                            },
                            "TEST__Node_child": {
                                "created": 1503389225848,
                                "name": "Node_child",
                                "modified": 1503389225848,
                                "id": "TEST__Node_child",
                                "type": "node",
                                "collectionChains": [
                                    [ "TEST__RootCollection", "TEST__Collection", "TEST__Collection_child" ],
                                    [ "TEST__RootCollection", "TEST__Collection_child" ],
                                ]
                            },
                        },
                    },
                })
            })
    })

    test("test moveToAbstraction() action move node to node", function() {
        /*
         * move a node to an abstraction by first converting the target to an abstraction
         */

    })

    test("test moveToAbstraction() action move collection to collection", function() {
        /*
         * must also update all collectionChains of children of source collection
        */


    })
})
