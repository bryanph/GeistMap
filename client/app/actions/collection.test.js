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

    afterEach(() => {
        mockServer.listeners = {}
    })

    afterAll(() => {
        return new Promise(resolve => {
            mockServer.stop(resolve)
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
                        "collections": [
                        ]
                    },
                    "TEST__Collection": {
                        "created": 1503389225848,
                        "name": "Collection",
                        "modified": 1503389225848,
                        "id": "TEST__Collection",
                        "collections": [
                            "TEST__RootCollection"
                        ]
                    },
                    "TEST__Collection_child": {
                        "created": 1503389225848,
                        "name": "Collection_child",
                        "modified": 1503389225848,
                        "id": "TEST__Collection_child",
                        "collections": [
                            "TEST__Collection",
                            "TEST__RootCollection",
                        ]
                    },
                    "TEST__Node_child": {
                        "created": 1503389225848,
                        "name": "Node_child",
                        "modified": 1503389225848,
                        "id": "TEST__Node_child",
                        "collections": [
                            "TEST__Collection_child",
                            "TEST__Collection",
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
                                "collections": [ ]
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "collections": [
                                    "TEST__RootCollection",
                                ]
                            },
                            "TEST__Collection_child": {
                                "created": 1503389225848,
                                "name": "Collection_child",
                                "modified": 1503389225848,
                                "id": "TEST__Collection_child",
                                "collections": [
                                    "TEST__Collection",
                                    "TEST__RootCollection",
                                ]
                            },
                            "TEST__Node_child": {
                                "created": 1503389225848,
                                "name": "Node_child",
                                "modified": 1503389225848,
                                "id": "TEST__Node_child",
                                "collections": [
                                    "TEST__Collection"
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
                        "collections": [
                        ]
                    },
                    "TEST__Collection": {
                        "created": 1503389225848,
                        "name": "Collection",
                        "modified": 1503389225848,
                        "id": "TEST__Collection",
                        "collections": [
                            "TEST__RootCollection"
                        ]
                    },
                    "TEST__Collection_child": {
                        "created": 1503389225848,
                        "name": "Collection_child",
                        "modified": 1503389225848,
                        "id": "TEST__Collection_child",
                        "collections": [
                            "TEST__Collection",
                            "TEST__RootCollection",
                        ]
                    },
                    "TEST__Node_child": {
                        "created": 1503389225848,
                        "name": "Node_child",
                        "modified": 1503389225848,
                        "id": "TEST__Node_child",
                        "collections": [ ]
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
                                "collections": [
                                ]
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "collections": [
                                    "TEST__RootCollection"
                                ]
                            },
                            "TEST__Collection_child": {
                                "created": 1503389225848,
                                "name": "Collection_child",
                                "modified": 1503389225848,
                                "id": "TEST__Collection_child",
                                "collections": [
                                    "TEST__Collection",
                                    "TEST__RootCollection",
                                ]
                            },
                            "TEST__Node_child": {
                                "created": 1503389225848,
                                "name": "Node_child",
                                "modified": 1503389225848,
                                "id": "TEST__Node_child",
                                "collections": [
                                    "TEST__Collection_child",
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
                        "collections": [
                        ]
                    },
                    "TEST__Collection": {
                        "created": 1503389225848,
                        "name": "Collection",
                        "modified": 1503389225848,
                        "id": "TEST__Collection",
                        "type": "collection",
                        "collections": [
                            "TEST__RootCollection"
                        ]
                    },
                    "TEST__Collection_child": {
                        "created": 1503389225848,
                        "name": "Collection_child",
                        "modified": 1503389225848,
                        "id": "TEST__Collection_child",
                        "collections": [
                            "TEST__Collection",
                            "TEST__RootCollection",
                        ]
                    },
                    "TEST__Node_child": {
                        "created": 1503389225848,
                        "name": "Node_child",
                        "modified": 1503389225848,
                        "id": "TEST__Node_child",
                        "collections": [
                            "TEST__Collection_child",
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
                                "collections": [
                                ]
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "type": "collection",
                                "collections": [
                                    "TEST__RootCollection"
                                ]
                            },
                            "TEST__Collection_child": {
                                "created": 1503389225848,
                                "name": "Collection_child",
                                "modified": 1503389225848,
                                "id": "TEST__Collection_child",
                                "collections": [
                                    "TEST__Collection",
                                    "TEST__RootCollection",
                                ]
                            },
                            "TEST__Node_child": {
                                "created": 1503389225848,
                                "name": "Node_child",
                                "modified": 1503389225848,
                                "id": "TEST__Node_child",
                                "collections": [
                                ]
                            },
                        },
                    },
                })
            })
    })

    test("Test moveToAbstraction() action move node to collection", function() {
        /*
         * move a node to an abstraction
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
                        "collections": [
                        ],
                        "children": [ "TEST__Collection", "TEST__Collection_child", "TEST__Node_child" ],
                        
                    },
                    "TEST__Collection": {
                        "created": 1503389225848,
                        "name": "Collection",
                        "modified": 1503389225848,
                        "id": "TEST__Collection",
                        "collections": [
                            "TEST__RootCollection",
                        ]
                        "children": [ "TEST__Collection_child" ],
                    },
                    "TEST__Collection_child": {
                        "created": 1503389225848,
                        "name": "Collection_child",
                        "modified": 1503389225848,
                        "id": "TEST__Collection_child",
                        "collections": [
                            "TEST__Collection",
                            "TEST__RootCollection",
                        ]
                    },
                    "TEST__Node_child": {
                        "created": 1503389225848,
                        "name": "Node_child",
                        "modified": 1503389225848,
                        "id": "TEST__Node_child",
                        "collections": [
                            "TEST__RootCollection",
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
                                "collections": [
                                ],
                                "children": [ "TEST__Collection", "TEST__Collection_child" ],
                            },
                            "TEST__Collection": {
                                "created": 1503389225848,
                                "name": "Collection",
                                "modified": 1503389225848,
                                "id": "TEST__Collection",
                                "collections": [
                                    "TEST__RootCollection",
                                ],
                                "children": [ "TEST__Collection_child" ],
                            },
                            "TEST__Collection_child": {
                                "created": 1503389225848,
                                "name": "Collection_child",
                                "modified": 1503389225848,
                                "id": "TEST__Collection_child",
                                "collections": [
                                    "TEST__Collection",
                                    "TEST__RootCollection",
                                ],
                                "TEST__Collection_child": [ "TEST__Node_child" ]
                            },
                            "TEST__Node_child": {
                                "created": 1503389225848,
                                "name": "Node_child",
                                "modified": 1503389225848,
                                "id": "TEST__Node_child",
                                "collections": [
                                    "TEST__Collection_child",
                                ]
                            },
                        },
                    },
                })
            })
    })
})
