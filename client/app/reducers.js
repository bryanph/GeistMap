"use strict"

/*
 * Visualization reducers
*/

// TODO: Separate this file - 2016-02-15
// see react-boilerplate for an approach
// TODO: Immutable datastructures for performance - 2016-03-24

import { combineReducers } from 'redux'
import _ from 'lodash'

import * as actionTypes from './actions/async'
import * as uiTypes from './actions/ui'

// function entities(state=initialEntities, action) {
//     if (action.response && action.response.entities) {
//         return _.merge({}, state, action.response.entities)
//     }
//     return state
// }

const entities = combineReducers({
    nodes,
    edges,
    collections,
    collectionEdges,
})

function nodes(state={}, action, collections) {
    /*
     * Handles the non-merging action types
     * // TODO: how to handle caching here? - 2016-06-11
    */

    switch(action.type) {

        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.omit(state, action.nodeId)
        // add collection id
        // TODO: use immutablejs with setIn for this, much easier to reason about - 2016-07-11
        case actionTypes.ADD_NODE_TO_COLLECTION_SUCCESS:
            return {
                ...state,
                [action.nodeId]: {
                    ...state[action.nodeId],
                    collections: [ 
                        ...state[action.nodeId].collections || [],
                        action.collectionId,
                    ],
                }
            }
        case actionTypes.REMOVE_COLLECTION_SUCCESS:
            // TODO: needs to know which nodes have this collection, so we can remove them from the array entry...
            return state
        case actionTypes.REMOVE_NODE_FROM_COLLECTION_SUCCESS:
            return {
                ...state,
                [action.nodeId]: {
                    ...state[action.nodeId],
                    collections: _.without(state[action.nodeId].collections, action.collectionId),
                }
            }

        case actionTypes.REMOVE_EDGE_SUCCESS:
            return {
                ...state,
                [action.start]: {
                    ...state[action.start],
                    edges: _.without(state[action.start].edges, action.id),
                },
                [action.end]: {
                    ...state[action.end],
                    edges: _.without(state[action.end].edges, action.id),
                }
            }

//         case actionTypes.GET_COLLECTION_SUCCESS:
//             /*
//              * for all nodes, check if they are in the GET_COLLECTION response
//              * this is for keeping ColletionDetail page in sync
//              * // TODO: should this be nescessary? - 2016-07-29
//             */

//             return {
//                 ...state,
//                 ..._.mapValues(action.response.entities.nodes, (node) => ({
//                     ...node,
//                     collections: [ 
//                         ...(node.collections || []),
//                         action.response.result.collection 
//                     ]
                        
//                 }))
//             }

        default:
            if (action.response && action.response.entities && action.response.entities.nodes) {
                return _.merge({}, state, action.response.entities.nodes)
                return {
                    ...state,
                    ...action.response.entities.nodes
                }
            }

            return state
    }
}

function edges(state={}, action) {
    /*
     * Handles the non-merging action types
    */
    switch(action.type) {
        case actionTypes.REMOVE_NODE_SUCCESS:
            // TODO: when removing the node, remove the edge as well - 2016-09-10
            // TODO: basically, need to know which edges have this node as a from or to, and then delete them  - 2016-09-10
            return state
        case actionTypes.REMOVE_EDGE_SUCCESS:
            return _.omit(state, action.id)


        default:
            if (action.response && action.response.entities && action.response.entities.edges) {
                return _.merge({}, state, action.response.entities.edges)
                return {
                    ...state,
                    ...action.response.entities.edges
                }
            }

            return state
    }
}
function collectionEdges(state={}, action) {
    /*
     * Handles the non-merging action types
    */
    switch(action.type) {
        case actionTypes.REMOVE_COLLECTION_SUCCESS:
            // TODO: need to know which edges have this collection as a to or a from - 2016-09-06
            const { collectionId } = action
            return _.filter(state, edge => {
                return !(edge.start === collectionId || edge.end === collectionId)
            })
            return state
        case actionTypes.REMOVE_COLLECTION_EDGE_SUCCESS:
            return _.omit(state, action.id)

        case uiTypes.ADD_COLLECTION:
            // temporarily add a collection and defer synching with the server
            return {
                ...state,
                [action.edgeId]: {
                    ...state[action.edgeId],
                    start: action.start,
                    end: action.id,
                    type: 'node',
                    editMode: true,
                }
            }

        case uiTypes.TOGGLE_EDIT_MODE:
            if (action.editMode) {
                // add the addCollectionEdges
                return {
                    ...state,
                    ...action.addCollectionEdges
                }
            } else {
                // remove the addCollectionEdges
                return _.omitBy(state, (e) => e.type === 'addCollection')
            }

        default:
            if (action.response && action.response.entities && action.response.entities.collectionEdges) {
                return _.merge({}, state, action.response.entities.collectionEdges)
            }

            return state
    }
}


function collections(state={}, action) {
    /*
     * Handles the non-merging action types
    */
    switch(action.type) {
        case actionTypes.ADD_NODE_TO_COLLECTION_SUCCESS:
            return {
                ...state,
                [action.collectionId]: {
                    ...state[action.collectionId],
                    count: (state[action.collectionId] && state[action.collectionId].count) || 0 + 1
                }
            }
        case actionTypes.REMOVE_NODE_SUCCESS:
            // TODO: decrement node count for the corresponding collections - 2016-08-26
            // TODO: actually, not nescessary, since we'll just refetch it? - 2017-05-23
            return state
        case actionTypes.REMOVE_NODE_FROM_COLLECTION_SUCCESS:
            return {
                ...state,
                [action.collectionId]: {
                    ...state[action.collectionId],
                    count: (state[action.collectionId] && state[action.collectionId].count) || 1 - 1
                }
            }
        case actionTypes.REMOVE_COLLECTION_SUCCESS:
            return _.omit(state, action.collectionId)

        case actionTypes.CONNECT_COLLECTIONS_SUCCESS:
            return {
                ...state,
                [action.end]: {
                    ...state[action.end],
                    count: state[action.end].count + state[action.start].count
                }
            }
        case actionTypes.REMOVE_COLLECTION_EDGE_SUCCESS:
            return {
                ...state,
                [action.end]: {
                    ...state[action.end],
                    count: state[action.end].count - state[action.start].count
                }
            }

        case uiTypes.TOGGLE_EDIT_MODE:
            if (action.editMode) {
                // add the addCollectionNodes
                return {
                    ...state,
                    ...action.addCollectionNodes
                }
            } else {
                // remove the addCollectionNodes
                return _.omitBy(state, (e) => e.type === 'addCollection')
            }

        case uiTypes.ADD_COLLECTION:
            // temporarily add a collection and defer synching with the server
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    type: 'node',
                    count: 0,
                    // TODO: created should also be set here - 2017-06-07
                }
            }

        case uiTypes.SET_ACTIVE_COLLECTION:
            // focus edit on this node, this causes d3 to react
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    editFocus: true,
                }
            }


        default:
            if (action.response && action.response.entities && action.response.entities.collections) {
                return _.merge({}, state, action.response.entities.collections)
            }

            return state
    }
}

function adjacencyMap(state={}, action) {
    /*
     * To what nodes does this node link?
    */
    switch(action.type) {
        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.omit(state, action.nodeId)
        default:
            // TODO: only keep track of detail nodes for an adjacency list - 2016-06-19
            if (action.response && action.response.entities && action.response.entities.edges) {

                const adjMap = {}

                _.forEach(action.response.entities.edges, edge => {
                    if (!adjMap[edge.start]) {
                        if (state[edge.start]) {
                            adjMap[edge.start] = [ ...state[edge.start] ] 
                        } else {
                            adjMap[edge.start] = []
                        }
                    }

                    adjMap[edge.start].push(edge.end)
                })

                return {
                    ...state,
                    ...adjMap,
                }
            }

            return state
    }
}

function reverseAdjacencyMap(state={}, action) {
    /*
     * What nodes link to this node?
    */
    switch(action.type) {
        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.omit(state, action.nodeId)
        default:

            // TODO: handle duplicates in the adjacency list - 2016-06-19
            // or handle this in the selector
            if (action.response && action.response.entities && action.response.entities.edges) {

                const adjMap = {}

                _.forEach(action.response.entities.edges, edge => {
                    if (!adjMap[edge.end]) {
                        if (state[edge.end]) {
                            adjMap[edge.end] = [ ...state[edge.end] ] 
                        } else {
                            adjMap[edge.end] = []
                        }
                    }

                    adjMap[edge.end].push(edge.start)
                })

                return {
                    ...state,
                    ...adjMap
                }

            }

            return state
    }
}

function edgeListMap(state={}, action) {
    /*
     * For every node, keep track of the incoming edges and outgoing edges
     * this way we don't have to keep this information up to date explicitly when fetching
    */

    switch(action.type) {
        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.omit(state, action.nodeId)
        case actionTypes.REMOVE_EDGE_SUCCESS:
            return {
                ...state,
                [action.start]: {
                    from: _.without(state[action.start].from, action.id),
                    to: state[action.start].to,
                },
                [action.end]: {
                    from: state[action.end].from,
                    to: _.without(state[action.end].to, action.id),
                }
            }
        default:
            // TODO: check before here... - 2016-08-12
            let map = { ...state }

            if (action.response && action.response.entities && action.response.entities.nodes) {
                // add nodes if they are not in the map yet
                _.forEach(Object.keys(action.response.entities.nodes), (id) => {
                    if (!map[id]) {
                        map[id] = {
                            from: [],
                            to: [],
                        }
                    }
                })
            }

            if (action.response && action.response.entities && action.response.entities.edges) {
                _.forEach(action.response.entities.edges, edge => {
                    console.log(edge.start);
                    map[edge.start].from.push(edge.id)
                    map[edge.end].to.push(edge.id)
                })
            }

            return map
    }
}


function pathL1Cache(state={}, action) {
    /*
     * stores ids involved in L1 paths previously fetched
     */

    switch(action.type) {
        // TODO: cleanup differently? - 2016-07-18
        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.omit(state, action.nodeId)
        // TODO: easier to get edges at least in real time? - 2016-07-18
        // TODO: handle CONNNECT and ADD_EDGE - 2016-07-18
        case actionTypes.GET_NODE_L1_SUCCESS:
            return {
                ...state,
                [action.response.result.node]: {
                    nodes: [ action.response.result.node, ...action.response.result.connectedNodes ],
                    edges: action.response.result.edges,
                },
            }
        default:
            return state
    }
}

function pathL2Cache(state={}, action) {
    /*
     * stores ids involved in L2 paths previously fetched
    */

    switch(action.type) {
        // TODO: cleanup differently? - 2016-07-18
        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.omit(state, action.nodeId)
        // TODO: handle CONNNECT and ADD_EDGE - 2016-07-18
        case actionTypes.CONNECT_NODES_SUCCESS:
        case actionTypes.ADD_EDGE_SUCCESS:
            // TODO: this only handles direct relations though - 2016-08-25
            const pathl2Keys = Object.keys(state)
            const l2Keys = _.intersection(pathl2Keys, [action.start, action.end])

            if (!l2Keys) {
                return state;
            }

            return _.reduce(l2Keys, (state, nodeId) => {
                const otherId = nodeId === action.start ? action.end : action.start
                return {
                    ...state,
                    [nodeId]: {
                        nodes: [ ...state[nodeId].nodes, otherId ],
                        edges: [ ...state[nodeId].edges, action.response.result ]
                    },
                }

            }, state)
        case actionTypes.GET_NODE_L2_SUCCESS:
            return {
                ...state,
                [action.response.result.node]: {
                    nodes: action.response.result.connectedNodes,
                    edges: action.response.result.edges,
                },
            }
        default:
            return state
    }
}

function inboxNodes(state=[], action) {
    switch(action.type) {
        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.without(state, action.nodeId)
        case actionTypes.GET_INBOX_NODES_SUCCESS:
            return action.response.result.nodes
        case actionTypes.ADD_NODE_TO_COLLECTION_SUCCESS:
            return _.without(state, action.nodeId)
        default:
            return state
    }
}

function batchNodes(state=[], action) {
    switch(action.type) {
        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.without(state, action.nodeId)
        case actionTypes.GET_ALL_BATCH_NODES_SUCCESS:
            // TODO: we also need to explicitly store edges? because we MUST only select edges that are explicitly between these nodes - 2016-07-23
            return action.response.result.nodes
        case actionTypes.CREATE_BATCH_NODE_SUCCESS:
            return [ ...state, action.response.result ]
        case actionTypes.DUPLICATE_NODE_SUCCESS:
            return action.isBatch ?  [ ...state, action.response.result ] : state
        case actionTypes.CONNECT_NODES_SUCCESS:
            const batchNodes = _.intersection(state, [action.start, action.end])
            if (batchNodes.length === 1) {
                return  [ ...state, action.start === batchNodes[0] ? action.end : action.start ]
            }
            return state
        case actionTypes.CLEAR_BATCH_NODES_SUCCESS:
            return []
        default:
            return state
    }
}


function nodesAndEdgesByCollectionId(state={}, action, nodes, globalState) {
    /*
     * stores a mapping of collection ids to the contained nodes and edges involved with those nodes
    */

    // TODO: make nodes/edges keys a mapping as well so we can easily remove the keys - 2016-07-18
    // also, order doesnt matter anyway
    switch(action.type) {
        // TODO: just do this explicitly in the API - 2016-07-18
        case actionTypes.GET_COLLECTION_SUCCESS:
            return {
                ...state,
                [action.response.result.collection]: {
                    nodes: action.response.entities.collections[action.response.result.collection].nodes,
                    edges: action.response.result.edges,
                },
            }
        case actionTypes.REMOVE_COLLECTION_SUCCESS:
            return _.omit(state, action.collectionId)
        case actionTypes.ADD_NODE_TO_COLLECTION_SUCCESS:
            // we added a node. Get its node and the edges of the new node to be added
            // add its nodes and its edges to the corresponding collection mapping
            // but... only add the edges which go to a node IN this collection!

            // TODO: its edges must also be added here... - 2016-07-18
            return {
                ...state,
                [action.collectionId]: {
                    nodes: [ ...((state[action.collectionId] && state[action.collectionId].nodes) || []), action.nodeId ],
                    edges: (state[action.collectionId] && state[action.collectionId].edges) || [],
                },
            }
        case actionTypes.CONNECT_NODES_SUCCESS:
        //     /*
        //      * add edge to all collections shared by both nodes
        //      * // TODO: we need collections in the response for both nodes - 2016-07-29
        //      * // TODO: must at least be added to the collections that are displayed in explore graph - 2016-07-29
        //     */
        //    return state


           const edge = action.response.entities.edges[action.response.result]
           const nodeStart = nodes[edge.start]
           const nodeEnd = nodes[edge.end]

           // TODO: call a selector for this - 2017-05-22
           const targetCollectionIds = _.union(nodeStart.collections, nodeEnd.collections)

            // TODO: should we add edge when endNode is not actually in the collection? - 2017-02-09

            return {
                ...state,
                ..._(targetCollectionIds)
                    .keyBy(x => x)
                    .mapValues(id => ({
                        ...(state[id] || {}),
                        edges: [ 
                            ...((state[id] || {}).edges || {}),
                            edge.id,
                        ],
                        nodes: [  // for when endNode is not in collection
                            ...((state[id] || {}).nodes || {}),
                            nodeEnd.id
                        ],
                    }))
                    .value()
            }



        case actionTypes.REMOVE_NODE_FROM_COLLECTION_SUCCESS:
        case actionTypes.REMOVE_NODE_SUCCESS:
            // get the node to be removed and its edges
            // remove the node from all collections that have been fetched as well as the edges

            // get all collections containing this node
            const collectionIds = _.intersection(
                nodes[action.nodeId].collections, // TODO: call a selector for this - 2017-05-22
                Object.keys(state)
            )

            if (collectionIds.length === 0) {
                return state
            }

            // remove node from the list and all edges containing this node
            let changedState = {}
            collectionIds.forEach(id => {
                changedState[id] = {
                    nodes: _.without((state[id] && state[id].nodes) || [], action.nodeId),
                    edges: _.without((state[id] && state[id].edges) || [], ...getEdgeIdsByNodeId(globalState, action.nodeId)),
                    // edges: (state[id] && state[id].edges) || [], // TODO: also remove edges involved - 2017-05-22
                }
            })

            return {
                ...state,
                ...changedState,
            }

        default:
            return state
    }
}

const initialErrorState = {
    errors: [],
    lastError: null,
}
// error handling, for displaying to user
function errors(state = initialErrorState, action) {

    if (action.type.endsWith('FAILURE')) {
        const { type, isHandled, error } = action

        const newError = {
            ...error,
            type,
            isHandled, // is being handled in the UI or should be handled by global UI
        }

        return {
            ...state,
            errors: [ ...errors, newError ],
            lastError: newError,
        }
    }

    if (action.type === uiTypes.RESET_ERROR_MESSAGE) {
        return { ...state, lastError: null }
    }
    
    return state
}


// keeps track of the number of calls being made for each request
// // TODO: Change to tokens? - 2016-05-11
const initialRequestState = _.chain(actionTypes)
    .pickBy((val, key) => key.endsWith('REQUEST'))
    .map((val, key) => [ key.split('_REQUEST')[0], false ])
    .fromPairs()
    .value()
function loadingStates(state=initialRequestState, action) {
    if (action.type.endsWith('REQUEST')) {
        return Object.assign({}, state, {
            [action.type.split('_REQUEST')[0]]: true,
        })
    }
    if (action.type.endsWith('SUCCESS')) {
        return Object.assign({}, state, {
            [action.type.split('_SUCCESS')[0]]: false,
        })
    }

    return state
}

// keeps track of whether all entities are synced or not
// // TODO: Change to tokens? - 2016-05-11
function synced(state=0, action) {
    if (action.type.endsWith('REQUEST')) {
        return state + 1
    }
    else if (action.type.endsWith('SUCCESS') || action.type.endsWith('FAILURE')) {
        return state - 1
    }

    return state
}

// TODO: Make this local to the component? - 2016-07-11
function allSearch(state=[], action) {
    switch(action.type) {
        case actionTypes.SEARCH_ALL_SUCCESS:
            return action.response
        default:
            return state
    }
}

// TODO: Make this local to the component? - 2016-07-11
function nodeSearch(state=[], action) {
    switch(action.type) {
        case actionTypes.SEARCH_NODE_SUCCESS:
            return action.response
        default:
            return state
    }
}

// TODO: Make this local to the component? - 2016-07-11
function collectionSearch(state=[], action) {
    switch(action.type) {
        case actionTypes.SEARCH_COLLECTION_SUCCESS:
            return action.response
        case actionTypes.RESET_SEARCH_COLLECTION:
            return []
        default:
            return state
    }
}

const initialUiState = {
    windowProps: {},
    connectWindowOpened: false,
    addRelationWindowOpened: false,
    addRelationCollectionWindowOpened: false,
    createCollectionWindowOpened: false,
    createCollectionWindowState: {
        title: "",
        description: "",
    },

    addNodeToCollectionWindowState: {
        opened: false,
        collection: null,
    },

    activeCollections: [],

    inboxSidebar: {
        opened: false,
    },

    editMode: {
        active: false
    }
}

const initialGraphUIState = {
    editMode: false,
    editFocus: {
        id: null
    }

}

function graphUiState(state=initialGraphUIState, action) {
    switch(action.type) {
        case uiTypes.TOGGLE_EDIT_MODE:
            return {
                ...state,
                editMode: !state.editMode.active,
            }

        case uiTypes.SET_ACTIVE_COLLECTION:
        case uiTypes.ADD_COLLECTION:
            return {
                ...state,
                editFocus: {
                    id: action.id,
                }
            }

        default:
            return state;
    }
}


function uiState(state=initialUiState, action) {
    switch(action.type) {
        case uiTypes.SHOW_CONNECT_WINDOW:
            return {
                ...state,
                connectWindowOpened: true,
                editorState: action.editorState,
            }
        case uiTypes.HIDE_CONNECT_WINDOW:
            return {
                ...state,
                connectWindowOpened: false,
            }
        case uiTypes.SHOW_ADD_RELATION_WINDOW:
            return {
                ...state,
                windowProps: action.windowProps,
                addRelationWindowOpened: true,
            }
        case uiTypes.SHOW_ADD_COLLECTION_RELATION_WINDOW:
            return {
                ...state,
                windowProps: action.windowProps,
                addCollectionRelationWindowOpened: true,
            }
        case uiTypes.HIDE_ADD_RELATION_WINDOW:
            return {
                ...state,
                addRelationWindowOpened: false,
                addCollectionRelationWindowOpened: false,
            }
        case uiTypes.SHOW_CREATE_COLLECTION_WINDOW:
            return {
                ...state,
                createCollectionWindowOpened: true,
                // createCollectionWindowState: action.payload,
            }
        case uiTypes.HIDE_CREATE_COLLECTION_WINDOW:
            return {
                ...state,
                createCollectionWindowOpened: false,
            }
        case uiTypes.SHOW_ADD_NODE_TO_COLLECTION_WINDOW:
            return {
                ...state,
                addNodeToCollectionWindowState: {
                    ...action.payload,
                    opened: true,
                }
            }
        case uiTypes.HIDE_ADD_NODE_TO_COLLECTION_WINDOW:
            return {
                ...state,
                addNodeToCollectionWindowState: {
                    ...state.addNodeToCollectionWindowState,
                    opened: false,
                }
            }
        case uiTypes.SHOW_ADD_PICTURE_WINDOW:
            return {
                ...state,
                addPictureWindowOpened: {
                    ...action.payload,
                    opened: true,
                }
            }
        case uiTypes.HIDE_ADD_PICTURE_WINDOW:
            return {
                ...state,
                addPictureWindowOpened: {
                    ...state.addPictureWindowOpened,
                    opened: false,
                }
            }
        case uiTypes.SHOW_ADD_VIDEO_WINDOW:
            return {
                ...state,
                addVideoWindowOpened: {
                    ...action.payload,
                    opened: true,
                }
            }
        case uiTypes.HIDE_ADD_VIDEO_WINDOW:
            return {
                ...state,
                addVideoWindowOpened: {
                    ...state.addVideoWindowOpened,
                    opened: false,
                }
            }
        case uiTypes.SHOW_INBOX_SIDEBAR:
            return {
                ...state,
                inboxSidebar: {
                    ...action.payload,
                    opened: true,
                }
            }
        case uiTypes.HIDE_INBOX_SIDEBAR:
            return {
                ...state,
                inboxSidebar: {
                    ...state.inboxSidebar,
                    opened: false,
                }
            }
        case uiTypes.TOGGLE_EDIT_MODE:
            return {
                ...state,
                editMode: {
                    active: !state.editMode.active,
                }
            }
        // used with CollectionExploreGraph
        case uiTypes.SET_ACTIVE_COLLECTIONS:
            return {
                ...state,
                activeCollections: action.collectionIds,
            }
        case uiTypes.SET_TITLE:
            return {
                ...state,
                title: action.title,
            }
        default:
            return state
    }
}

function serverUiState(state, action) {
    switch(action.type) {
        case actionTypes.UPDATE_UI_SUCCESS:
            return {
                ...state,
                ...action.payload,
            }
        default:
            return state
    }
}

function user(state={}, action) {
    switch(action.type) {
        // case ActionTypes.UPDATE_USER_UI_SUCCESS:
        //     return action.response
        // case ActionTypes.UPDATE_USER_PROFILE_SUCCESS:
        //     return action.response
        default:
            return state
    }
}

function editorState(state=null, action) {
    switch (action.type) {
        case uiTypes.SET_EDITOR_STATE:
            return action.payload
        default: 
            return state
    }
}

function rootReducer(state={}, action) {
    return {
        entities: entities(state.entities, action),
        adjacencyMap: adjacencyMap(state.adjacencyMap, action),
        reverseAdjacencyMap: reverseAdjacencyMap(state.reverseAdjacencyMap, action),
        edgeListMap: edgeListMap(state.edgeListMap, action),
        pathL1Cache: pathL1Cache(state.pathL1Cache, action),
        pathL2Cache: pathL2Cache(state.pathL2Cache, action),
        nodesAndEdgesByCollectionId: nodesAndEdgesByCollectionId(state.nodesAndEdgesByCollectionId, action, (state.entities && state.entities.nodes) || {}, state),
        inboxNodes: inboxNodes(state.inboxNodes, action),
        batchNodes: batchNodes(state.batchNodes, action),
        // errorMessage: errorMessage(state.errorMessage, action),
        loadingStates: loadingStates(state.loadingStates, action),
        synced: synced(state.synced, action),
        allSearch: allSearch(state.allSearch, action),
        nodeSearch: nodeSearch(state.nodeSearch, action),
        collectionSearch: collectionSearch(state.collectionSearch, action),
        uiState: uiState(state.uiState, action),
        serverUiState: serverUiState(state.serverUiState, action),
        user: user(state.user, action),
        editorState: editorState(state.editorState, action),
        errors: errors(state.errors, action),
    }
}

export default rootReducer



function memoize() {

}

/*
 * SELECTORS
 * See https://github.com/reactjs/reselect
*/

import { createSelector } from 'reselect'

export const getNodes = (state, id) => _.map(state.entities.nodes, x => x)
export const getNode = (state, id) => state.entities.nodes[id]

export const getNodesForIds = (ids) => ids.map(id => getNode(state, id))

export const getEdges = (state, id) => _.map(state.entities.edges, x => x)
export const getEdge = (state, id) => state.entities.edges[id]

export const getCollectionEdge = (state, id) => state.entities.collectionEdges[id]
export const getCollectionEdges = (state, id) => _.map(state.entities.collectionEdges, x => x)


export const getNeighbouringNodes = (state, id) => {
    /*
     * get the directly neighbouring nodes (including the node itself)
     * // TODO: easier: just get it from the response? - 2016-07-18
    */

    return _([
        id,
        ...(state.adjacencyMap[id] || []),
        ...(state.reverseAdjacencyMap[id] || []),
    ])
        .uniq()
        .map(id => getNode(state, id))
        .filter(x => typeof x !== 'undefined')
        .value()
}

export const getEdgeIdsByNodeId = (state, id) => {
    /*
     * Direct edges from node
    */

    return [
        ...state.edgeListMap[id].from,
        ...state.edgeListMap[id].to,
    ]
}

export const getEdgesByNodeId = (state, id) => {
    /*
     * get the direct neighbouring edges for a node with id ${id}
    */
    return getEdgeIdsByNodeId(state, id).map(id => getEdge(state, id))
}

export const getEdgesForNodes = (state, ids) => {
    /*
     * Gets all edges between [ ids ]
    */

    // filter edges that have start/end not inside this collection of elements
    return _(ids)
        .map(id => getEdgesByNodeId(state, id))
        .flatMap()
        .uniqBy('id')
        .filter(edge => {
            // must both be in ids[] array, otherwise we get edges pointing to nodes not in ids[]
            return _.every([edge.start, edge.end], (id) => _.includes(ids, id))
        })
        .value()
}

// TODO: how can we ensure consistent order? - 2016-06-18
// TODO: Keep track of an adjacency list in a reducer to make this faster 2016-06-19
export const getEdgesFromNode = (state, id) => (
    _(state.entities.edges)
        .filter(edge => edge.start === id)
        .map(edge => ({
            ...edge,
            start: getNode(state, edge.start),
            end: getNode(state, edge.end),
        }))
        .value()
)

export const getEdgesToNode = (state, id) => (
    _(state.entities.edges)
        .filter(edge => edge.end === id)
        .map(edge => ({
            ...edge,
            start: getNode(state, edge.start),
            end: getNode(state, edge.end),
            
        }))
        .value()
)

export const getCollections = (state, id) => _.map(state.entities.collections, x => x)
export const getCollection = (state, id) => state.entities.collections[id]

export const getCollectionsByNodeId = (state, id) => {
    const node = getNode(state, id)

    if (!node) {
        return []
    }

    return (node.collections || []).map(id => getCollection(state, id)).filter(x => x !== undefined)
}


export const getNodeIdsByCollectionId = (state, id) => (
    (state.nodesAndEdgesByCollectionId[id] || { nodes: [] }).nodes
)
export const getNodesByCollectionId = (state, id) => (
    getNodeIdsByCollectionId(state, id)
        .map(nodeId => getNode(state, nodeId))
)

export const getEdgeIdsByCollectionId = (state, id) => (
    (state.nodesAndEdgesByCollectionId[id] || { edges: [] }).edges
)
export const getEdgesByCollectionId = (state, id) => (
    getEdgeIdsByCollectionId(state, id)
        .map(edgeId => getEdge(state, edgeId))
)

export const getActiveCollectionIds = (state) => state.uiState.activeCollections
export const getActiveCollections = (state) => (
    getActiveCollectionIds(state).map(id => getCollection(state, id))
)


export const getNodesByActiveCollectionIds = (state) => (
    _(getActiveCollectionIds(state))
        .map(id => getNodeIdsByCollectionId(state, id))
        .flatMap()
        .uniq()
        .map(id => getNode(state, id))
        .value()
)

export const getEdgesByActiveCollectionIds = (state) => (
    _(getActiveCollectionIds(state))
        .map(id => getEdgeIdsByCollectionId(state, id))
        .flatMap()
        .uniq()
        .map(id => getEdge(state, id))
        .value()
)

export const getL2Nodes = (state, id) => (
    state.pathL2Cache[id] && state.pathL2Cache[id].nodes.map(id => getNode(state, id))
)
export const getL2Edges = (state, id) => (
    // _(getL2Nodes(state, id))
    //     // TODO: MUST check whether both edges endpoints are in this path
    //     .map(node => [ node.start, node.end ])
    //     .flatMap()
    //     .uniq()
    //     .map(id => getEdge(state, id))
    //     .value()
    state.pathL2Cache[id] && state.pathL2Cache[id].edges.map(id => getEdge(state, id))
)

export const getInboxNodes = (state, id) => (
    state.inboxNodes.map(id => getNode(state, id))
)

export const getBatchNodes = (state) => (
    state.batchNodes.map(id => getNode(state, id))
)

export const isSynced = (state) => !state.synced






// TODO: progress for selector performance improvements... - 2016-08-16


// export const getEdgeIdsByNodeId = (state, id) => {
//     /*
//      * Direct edges from node
//     */

//     return [
//         ...state.edgeListMap[id].from,
//         ...state.edgeListMap[id].to,
//     ]
// }
// export const getEdgesByNodeId = (state, id) => {
//     /*
//      * get the direct neighbouring edges for a node with id ${id}
//     */
//     return getEdgeIdsByNodeId(state, id).map(id => getEdge(state, id))
// }

// export const getEdgesForNodeIds = (nodes, edges, ids) => {
//     /*
//      * Gets all edges between [ ids ]
//     */

//     // filter edges that have start/end not inside this collection of elements
//     return _(ids)
//         .map(id => getEdgesByNodeId(edges, id))
//         .flatMap()
//         .uniqBy('id')
//         .filter(edge => {
//             // must both be in ids[] array, otherwise we get edges pointing to nodes not in ids[]
//             return _.every([edge.start, edge.end], (id) => _.includes(ids, id))
//         })
//         .value()
// }
// export const batchNodesSelector = createSelector(
//     (state) => state.entities.nodes,
//     (state) => state.batchNodes,
//     (nodes, batchNodeIds) => batchNodeIds.map(getNode),
// )
// export const batchEdgesSelector = createSelector(
//     (state) => state.entities.nodes,
//     (state) => state.entities.edges,
//     (state) => state.batchNodes,
//     (nodes, edges batchNodeIds) => getEdgesForNodes(nodes, edges, batchNodeIds),
// )

