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
                collections: {
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
                        collections: {
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

    })
})




describe('abstractions', () => {

    /*
     * Test manipulating abstractions
    */
    test('add node to abstraction', () => {
        const collectionId = uuidV4()
        const id = uuidV4()

        const abstractionChain = [ collectionId ]

        const action = {
            collectionId: collectionId,
            nodeId: id,
            abstractionChain,
            response: {
                entities: {
                    collections: {
                        [ collectionId ]: {
                            name: 'My knowledge base',
                            modified: '1500203173558',
                            id: collectionId,
                            type: 'root',
                            isRootCollection: true
                        }
                    },
                    nodes: {
                        [ id ]: {
                            ok: 'what',
                            name: 'add_node',
                            modified: '1501584264723',
                            id: id,
                            type: 'node',
                            created: '1501584264723'
                        }
                    }
                },
                result: {
                    collection: collectionId,
                    node: id,
                }
            },
            type: 'ADD_NODE_TO_COLLECTION_SUCCESS'
        }

        expect(
            nodesReducer({
                [id]: {
                    name: 'd',
                    modified: '1501582629992',
                    id: id,
                    type: 'node',
                    created: '1501582629992',
                    collectionChains: [],
                }
            }, action)
        ).toEqual({
            [id]: {
                name: 'd',
                modified: '1501582629992',
                id: id,
                type: 'node',
                created: '1501582629992',
                collectionChains: [
                    abstractionChain,
                ]
            }
        })

        /*
         * adds the node to the nodes that will be considered for the derived data
        */
        expect(
            abstractionDetailReducer({
                [collectionId]: {
                    nodes: [],
                    edges: [],
                }
            }, action)
        ).toEqual({
            [collectionId]: {
                nodes: [ id ],
                edges: [],
            }
        })
    })

    test('Add abstraction to abstraction', () => {

    })

    test('should handle MOVE_TO_ABSTRACTION_SUCCESS', () => {
        /*
         *
        */

    })
})
