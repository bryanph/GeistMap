/* @flow */

/*
 * Visualization reducers
*/

// TODO: Separate this file - 2016-02-15
// see react-boilerplate for an approach
// TODO: Immutable datastructures for performance - 2016-03-24

import { combineReducers } from 'redux'
import _ from 'lodash'

import * as actionTypes from '../actions/async'
import * as uiTypes from '../actions/ui'

import update from 'immutability-helper'

function entities(state={}, action, globalState) {
    return {
        nodes: nodes(state.nodes, action, globalState),
        edges: edges(state.edges, action, globalState),
        collections: collections(state.collections, action, globalState),
        collectionEdges: collectionEdges(state.collectionEdges, action, globalState),
    }
}

export function nodes(state={}, action, collections) {
    /*
     * Handles the non-merging action types
    */
    switch(action.type) {
        case actionTypes.REMOVE_NODE_SUCCESS:
            return _.omit(state, action.nodeId)

        // TESTED
        case actionTypes.ADD_NODE_TO_COLLECTION_SUCCESS:
            return update(state, {
                [action.nodeId]: {
                    collections: { $push: [ action.collectionId ]}
                }
            })

        case actionTypes.REMOVE_COLLECTION_SUCCESS:
            // TODO: needs to know which nodes have this collection, so we can remove them from the array entry...
            // TODO: same for REMOVE_ABSTRACTION_SUCCESS
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
        case uiTypes.TOGGLE_COLLAPSE_COLLECTION:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    collapsed: !state[action.id].collapsed,
                }
            }

        case actionTypes.MOVE_TO_ABSTRACTION_SUCCESS:
            return update(state, {
                [action.sourceId]: { collections: { $push: [ action.targetId ]}}
            })

        case actionTypes.CONVERT_NODE_TO_COLLECTION_SUCCESS:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    ...action.response.entities.nodes[action.id],
                    collapsed: true,
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

function edges(state={}, action, globalState) {
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
                    isSynced: false,
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
        case actionTypes.REMOVE_COLLECTION_SUCCESS:
            return _.omit(state, action.collectionId)

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
            // TODO: should this be done with more of a "sync" behaviour? - 2017-06-14
            // temporarily add a collection and defer synching with the server
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    type: 'node',
                    isNew: true,
                    parentId: action.start, // parent node
                    edgeId: action.edgeId, // id of edge to the parent node
                    // TODO: created should also be set here - 2017-06-07
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
                    if (!map[edge.start] || !map[edge.end]) {
                        return;
                    }

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

function nodesByCollectionId(state={}, action) {
    /*
     * A mapping of nodes by collection Id
     * // TODO: this is for now recomputed on every fetch (no merging) - 2017-07-14
    */
    switch(action.type) {
        case actionTypes.GET_COLLECTION_SUCCESS:
            let newState = { ...state }
            // for every node, add them to the corresponding collection list
            _.forEach(action.response.entities.nodes, node => {
                _.forEach(node.collections, c => {
                    if (!newState[c]) {
                        newState[c] = [ node.id ]
                    } else {
                        newState[c].push(node.id)
                    }
                })
            })

            return newState

        case actionTypes.REMOVE_COLLECTION_SUCCESS:
        case actionTypes.REMOVE_ABSTRACTION_SUCCESS:
            return _.omit(state, action.collectionId)

        case actionTypes.MOVE_TO_ABSTRACTION_SUCCESS:
            if (!state[action.targetId]) {
                state[action.targetId] = []
            }

            return update(state, {
                [action.targetId]: { $push: [ action.sourceId ]}
            })

        default:
            return state
    }
}

export function abstractionDetail(state={}, action, nodes, globalState) {
    /*
     * stores a mapping of collection ids to the contained nodes and edges involved with those nodes
     * (this is used to compute derived data)
    */

    switch(action.type) {

        // this resets the state
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

        case actionTypes.MOVE_TO_ABSTRACTION_SUCCESS:
            /*
             * remove the edges between the two nodes (since these are now abstraction relations)
            */

            return update(state, {
                [action.sourceCollectionId]: {
                    edges: { $set: _.without(
                        state[action.sourceCollectionId].edges,
                        ...getEdgesForNodes(globalState, [action.sourceId, action.targetId]).map(e => e.id)
                    )}
                }
            })

        // TESTED
        case actionTypes.ADD_NODE_TO_COLLECTION_SUCCESS:
            // TODO: need to know from which view we did this, so the edges can be added - 2017-08-02
            // edges are derived data
            return update(state, {
                [action.collectionId]: {
                    nodes: { $push: [ action.nodeId ]}
                }
            })

        case actionTypes.CONNECT_NODES_SUCCESS:
             /*
              * add edge to the source collection (from which it was called)
             */

            if (action.sourceCollectionId) {
                return update(state, {
                    [action.sourceCollectionId]: {
                        edges: { $push: [ action.response.result ]} // pushes the edge id
                    }
                })
                return update
            }

            return state

        case actionTypes.REMOVE_NODE_FROM_COLLECTION_SUCCESS:
        case actionTypes.REMOVE_NODE_SUCCESS:
            // get the node to be removed and its edges
            // remove the node from all collections that have been fetched as well as the edges

            if (action.collectionId) {
                return update(state, {
                    [action.collectionId]: {
                        nodes: { $set: _.without((state[action.collectionId] && state[action.collectionId].nodes) || [], action.nodeId) },
                        edges: { $set: _.without((state[action.collectionId] && state[action.collectionId].edges) || [], ...getEdgeIdsByNodeId(globalState, action.nodeId)) },
                    }
                })
            }

            return state;

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
}

const initialGraphUIState = {
    // can be "view", "edit", "focus" or "expand"
    mode: "view",
    focus: {
        id: null,
    },
}

function graphUiState(state=initialGraphUIState, action) {
    /*
     * UI state related to the graph
    */
    switch(action.type) {
        case uiTypes.SET_ACTIVE_COLLECTION:
        case uiTypes.SET_ACTIVE_NODE:
        case uiTypes.ADD_COLLECTION:
            return {
                ...state,
                focus: {
                    id: action.id,
                }
            }

        case uiTypes.SET_GRAPH_MODE:
            return {
                ...state,
                mode: action.payload,
            }

        case uiTypes.TOGGLE_EDIT_MODE:
            return {
                ...state,
                mode: state.mode === "edit" ? "view" : "edit",
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
        // used with CollectionExploreGraph
        case uiTypes.SET_ACTIVE_COLLECTIONS:
            return {
                ...state,
                activeCollections: action.collectionIds,
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
        entities: entities(state.entities, action, state),
        adjacencyMap: adjacencyMap(state.adjacencyMap, action),
        reverseAdjacencyMap: reverseAdjacencyMap(state.reverseAdjacencyMap, action),
        edgeListMap: edgeListMap(state.edgeListMap, action),
        pathL1Cache: pathL1Cache(state.pathL1Cache, action),
        pathL2Cache: pathL2Cache(state.pathL2Cache, action),
        nodesByCollectionId: nodesByCollectionId(state.nodesByCollectionId, action),
        abstractionDetail: abstractionDetail(state.abstractionDetail, action, (state.entities && state.entities.nodes) || {}, state),
        inboxNodes: inboxNodes(state.inboxNodes, action),
        batchNodes: batchNodes(state.batchNodes, action),
        // errorMessage: errorMessage(state.errorMessage, action),
        loadingStates: loadingStates(state.loadingStates, action),
        synced: synced(state.synced, action),
        allSearch: allSearch(state.allSearch, action),
        nodeSearch: nodeSearch(state.nodeSearch, action),
        collectionSearch: collectionSearch(state.collectionSearch, action),
        uiState: uiState(state.uiState, action),
        graphUiState: graphUiState(state.graphUiState, action),
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


export const getL1Nodes = (state, id) => {
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

    if (!state.edgeListMap[id]) {
        return []
    }

    return [
        ...state.edgeListMap[id].from,
        ...state.edgeListMap[id].to,
    ]
}

export const getEdgesForNodes = (state, ids) => {
    /*
     * Gets all edges between [ ids ]
    */

    // filter edges that have start/end not inside this collection of elements
    return _(ids)
        .map(id => getL1Edges(state, id))
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
    state.nodesByCollectionId[id] || []
)

export const getNeighbouringNodesAndEdgesByCollectionId = (state, id) => (
    state.abstractionDetail[id] || { nodes: [], edges: [] }
)

export const getNodesAndEdgesByCollectionId = (state, id) => {
    // this gets the direct nodes including their children
    const nodesAndEdges = getNeighbouringNodesAndEdgesByCollectionId(state, id)

    // nodes includes both nodes and collections
    const nodesAndCollections = nodesAndEdges.nodes.map(id => getNode(state, id))
    const nodes = nodesAndCollections.filter(n => n.type === 'node')
    const collections = nodesAndCollections.filter(n => n.type === 'collection')

    const edges = nodesAndEdges.edges.map(edgeId => getEdge(state, edgeId))

    const parentCollection = getCollection(state, id)
    // TODO: this won't work when the abstraction belongs to multiple other abstractions
    // instead, need to specify full chain in the URL (or identify each abstraction chain different) => probably better
    const collectionChain = (parentCollection && parentCollection.collections) || []

    let visibleCollections = []
    let visibleNodes = []

    let nodeMap = _.keyBy(nodesAndCollections, n => n.id)
    let hiddenNodeMap = {}
    let visibleNodeMap = {}

    // copy edges
    let transformedEdges = edges.map(e => Object.assign({}, e))

    const collectionIds = collections.map(c => c.id)

    // add :NODE nodes that are direct children of this collection
    nodes.forEach(node => {
        if (_.intersection(node.collections, collectionIds).length === 0) {
            visibleNodes.push(node)
            visibleNodeMap[node.id] = node
        }
    })

    console.log(nodes, collections);

    collections.forEach(c => {
        // TODO: can also be hidden because the parent is collapsed - 2017-08-03
        // check if this collection has a parent, and that parent is not collapsed
        // => hide the collection

        if (c.collapsed) {
            /*
             * Hide nodes that are not expanded due to another collection
            */

            // returns node ids for this collection (not all, just the ones that were fetched)
            const nodeIds = getNodeIdsByCollectionId(state, c.id)

            nodeIds.forEach(n => {
                // if not shown already, don't show the node
                if (!visibleNodeMap[n]) {
                    hiddenNodeMap[n] = n
                }
            })

            // visibleCollections.push(c)
            visibleCollections.push({
                ...c,
                // TODO: this count won't work - 2017-08-02
                count: nodeIds.length
            })


            // TODO: more performant - 2017-07-13
            transformedEdges = _(transformedEdges)
                .map((e) => {
                    if (visibleNodeMap[e.start] && visibleNodeMap[e.end]) {
                        // this link is in the graph directly, no need to alter edges
                        console.log("LINK IS IN GRAPH DIRECTLY");
                        return e;
                    }

                    // console.log(e, nodeMap[e.start], nodeMap[e.end]);

                    // method for getting collections from node
                    if (_.difference(collectionChain, nodeMap[e.start].collections).length > 0) {
                        // console.log("REMOVING BECAUSE OF START");
                        // the edge start is not part of this collection chain
                        return null;
                    }
                    if (_.difference(collectionChain, nodeMap[e.end].collections).length > 0) {
                        // console.log("REMOVING BECAUSE OF END");
                        // the edge end is not part of this collection chain
                        return null;
                    }

                    // if start is hidden, change start to this collection
                    if (hiddenNodeMap[e.start]) {
                        console.log("CHANGING START");
                        e.start = c.id
                    }
                    if (hiddenNodeMap[e.end]) {
                        console.log("CHANGING END");
                        e.end = c.id
                    }
                    if (e.start === e.end) {
                        // console.log("BOTH INSIDE THE SAME ABSTRACTION");
                        return null
                    }

                    return e
                })
                .filter(x => x !== null)
                .value()
        }

        else {
            // TODO: this should only get the direct children - 2017-08-03
            getNodeIdsByCollectionId(state, c.id).forEach(n => {
                visibleNodes.push(getNode(state, n))
                visibleNodeMap[n] = n

                // we want to show this node even if it was hidden by another collection
                if (hiddenNodeMap[n]) {
                    delete hiddenNodeMap[n]
                }
            })

            // hide direct edges from/to this collection
            transformedEdges = _(transformedEdges)
                .filter((e) => {
                    // TODO: should only happen for direct edges - 2017-07-14
                    if (e.start === c.id) {
                        return false
                    }

                    if (e.end === c.id) {
                        return false

                    }

                    return true
                })
                .value()
        }
    })

    console.log(transformedEdges);
    // console.log(nodes, collections,  edges);

    return {
        nodes: visibleNodes,
        collections: collections,
        visibleCollections,
        edges: transformedEdges,
        collectionChain: collectionChain.map(id => getCollection(state, id)),
    }
}

export const getEdgeIdsByCollectionId = (state, id) => (
    (state.abstractionDetail[id] || { edges: [] }).edges
)

export const getEdgesByCollectionId = (state, id) => (
    getEdgeIdsByCollectionId(state, id).map(edgeId => getEdge(state, edgeId))
)

export const getL2Nodes = (state, id) => (
    state.pathL2Cache[id] && state.pathL2Cache[id].nodes.map(id => getNode(state, id))
)
export const getL1Edges = (state, id) => {
    /*
     * get the direct neighbouring edges for a node with id ${id}
    */
    return getEdgeIdsByNodeId(state, id).map(id => getEdge(state, id))
}

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
