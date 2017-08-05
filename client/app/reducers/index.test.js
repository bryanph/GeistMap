import reducer from './index.js'

import * as actionTypes from '../actions/async'
import * as uiTypes from '../actions/ui'

import {
    nodes as nodesReducer,
    abstractionDetail as abstractionDetailReducer
} from './index.js'

const uuidV4 = require('uuid/v4');

describe('nodes', () => {
    test('should handle CREATE_NODE_SUCCESS', () => {
        const id = uuidV4()
        expect(
            nodesReducer({}, {
                type: actionTypes.CREATE_NODE_SUCCESS,
                id: id,
                response: {
                    entities: {
                        nodes: {
                            [id]: {
                                name: 'd',
                                modified: '1501582629992',
                                id: id,
                                type: 'node',
                                created: '1501582629992',
                                collections: [],
                            }
                        }
                    },
                    result: id,
                },
                type: 'CREATE_NODE_SUCCESS'
            })
        ).toEqual({
            [id]: {
                name: 'd',
                modified: '1501582629992',
                id: id,
                type: 'node',
                created: '1501582629992',
                collections: [],
            }
        })
    })
})

describe('abstractions', () => {
    /*
     * Test creating abstractions
    */

    test('should handle ADD_NODE_TO_COLLECTION_SUCCESS', () => {
        const collectionId = uuidV4()
        const id = uuidV4()

        const action = {
            collectionId: collectionId,
            nodeId: id,
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
                    collections: [],
                }
            }, action)
        ).toEqual({
            [id]: {
                name: 'd',
                modified: '1501582629992',
                id: id,
                type: 'node',
                created: '1501582629992',
                collections: [ collectionId ]
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

    test('should handle MOVE_TO_ABSTRACTION_SUCCESS', () => {
        /*
         *
        */

    })
})
