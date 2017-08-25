
import * as nodeActionTypes from '../actions/node'
import * as collectionActionTypes from '../actions/collection'
import * as uiActionType from '../actions/ui'
import rootReducer from '../reducers'

import uuidV4 from 'uuid/v4'

import { WebSocket, Server, SocketIO } from 'mock-socket'
import io from 'socket.io-client'

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'
import promise from 'redux-promise'

import createSocketMiddleware from '../middleware/api'
import restApiMiddleware from '../middleware/restApi'

const createMockStore = (initialState) => {
    const _socket = SocketIO('http://localhost:8080');
    const socketMiddleware = createSocketMiddleware(_socket)
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk, promise, socketMiddleware, restApiMiddleware),
    );
}

let store, mockServer;

import {
    createNode,
} from './node'

mockServer = new Server('http://localhost:8080');
describe('node actions', () => {

    beforeAll((done) => {
        return new Promise(resolve => {
            console.log("calling beforeAll()")
            _socket.on('connection', () => {
                console.log("connection!")
                resolve()
            })
        })
    })

    afterAll(() => {
        return new Promise(resolve => {
            mockServer.stop(resolve)
        })
    })


    /*
     * Tests the node actions and the reducer reacting on the state changes
    */
    test("Test Node.create() passes the correct actions", () => {

        mockServer.on('Node.create', (id, data, res) => {
            console.log("Node.create() was called")
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
        store = createMockStore()

        return store.dispatch(createNode("TEST__Node", { name: "Node" }))
            .then((action) => {
                console.log(action)
                console.log(require('util').inspect(store.getState(), false, null))
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
})

