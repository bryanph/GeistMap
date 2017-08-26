
import * as nodeActionTypes from '../actions/node'
import * as collectionActionTypes from '../actions/collection'
import * as uiActionType from '../actions/ui'
import rootReducer from '../reducers'

const uuidV4 = require('uuid/v4');
jest.mock('uuid/v4')
const uuidV4Actual = require.requireActual('uuid/v4');

import { WebSocket, Server, SocketIO } from 'mock-socket'
import io from 'socket.io-client'

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'
import promise from 'redux-promise'

import createSocketMiddleware from '../middleware/api'
import restApiMiddleware from '../middleware/restApi'

const createMockStore = (socket, initialState) => {
    const socketMiddleware = createSocketMiddleware(socket)
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk, promise, socketMiddleware, restApiMiddleware),
    );
}

let _socket, store, mockServer;

import * as nodeActions from './node'

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

    })
})

