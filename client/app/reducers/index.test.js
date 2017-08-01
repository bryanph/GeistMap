import reducer from './index.js'

import * as actionTypes from '../actions/async'
import * as uiTypes from '../actions/ui'

import {
    nodes as nodesReducer
} from './index.js'

const uuidV4 = require('uuid/v4');

describe('nodes', () => {
    test.only('should handle CREATE_NODE_SUCCESS', () => {
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
    test('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual([
            {
                text: 'Use Redux',
                completed: false,
                id: 0
            }
        ])
    })

    test.only('should handle ADD_NODE_TO_COLLECTION_SUCCESS', () => {
        // TODO: first mock a store with the root PKB collection and the node to be added - 2017-08-01

        const collectionId = uuidV4()
        const id = uuidV4()

        const initialState = {
            [id]: {
                name: 'd',
                modified: '1501582629992',
                id: id,
                type: 'node',
                created: '1501582629992',
                collections: [],
            }
        }

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
            nodesReducer(initialState, action)
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
    })

    it('should handle ADD_TODO', () => {
        expect(
            reducer([], {
                type: types.ADD_TODO,
                text: 'Run the tests'
            })
        ).toEqual([
            {
                text: 'Run the tests',
                completed: false,
                id: 0
            }
        ])

        expect(
            reducer(
                [
                    {
                        text: 'Use Redux',
                        completed: false,
                        id: 0
                    }
                ],
                {
                    type: types.ADD_TODO,
                    text: 'Run the tests'
                }
            )
        ).toEqual([
            {
                text: 'Run the tests',
                completed: false,
                id: 1
            },
            {
                text: 'Use Redux',
                completed: false,
                id: 0
            }
        ])
    })
})
