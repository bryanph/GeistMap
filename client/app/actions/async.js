
/*
 * Async actions
 */

import fetchJSON from '../utils/fetch'
import { normalize, Schema, arrayOf } from 'normalizr'

import Schemas from '../schemas'
import { CALL_API } from '../middleware/api'
import { CALL_REST_API } from '../middleware/restApi'

import {
    getCollection,
    getNode,
    getAbstractionChain,
 } from '../reducers'
import {
    getEdge,
    getCollectionEdge,
 } from '../reducers'

import { batchActions } from '../middleware/batch'

const uuidV4 = require('uuid/v4');

export const GET_ALL_REQUEST = 'GET_ALL_REQUEST'
export const GET_ALL_SUCCESS = 'GET_ALL_SUCCESS'
export const GET_ALL_FAILURE = 'GET_ALL_FAILURE'

export function getAllNodesAndEdges() {
    /*
     * // TODO: this probably isn't a scalable call - 2016-06-12
     * // TODO: instead, have a collection overview graph generated on the server - 2016-06-12
    */

    return {
        [CALL_API]: {
            types: [ GET_ALL_REQUEST, GET_ALL_SUCCESS, GET_ALL_FAILURE ],
            endpoint: 'Node.getAll',
            schema: {
                nodes: arrayOf(Schemas.NODE),
                edges: arrayOf(Schemas.EDGE),
            },
        }
    }
}

export const GET_ALL_BATCH_NODES_REQUEST = 'GET_ALL_BATCH_NODES_REQUEST'
export const GET_ALL_BATCH_NODES_SUCCESS = 'GET_ALL_BATCH_NODES_SUCCESS'
export const GET_ALL_BATCH_NODES_FAILURE = 'GET_ALL_BATCH_NODES_FAILURE'
export function getAllBatchNodes() {
    /*
     * to persist only one (for now) batch session
    */
    return {
        [CALL_API]: {
            types: [ GET_ALL_BATCH_NODES_REQUEST, GET_ALL_BATCH_NODES_SUCCESS, GET_ALL_BATCH_NODES_FAILURE ],
            endpoint: 'Node.getAllBatchNodes',
            schema: {
                nodes: arrayOf(Schemas.NODE),
                edges: arrayOf(Schemas.EDGE),
            }
        }
    }
}

/*
 * Create a node
*/
export const CREATE_BATCH_NODE_REQUEST = 'CREATE_BATCH_NODE_REQUEST'
export const CREATE_BATCH_NODE_SUCCESS = 'CREATE_BATCH_NODE_SUCCESS'
export const CREATE_BATCH_NODE_FAILURE = 'CREATE_BATCH_NODE_FAILURE'

export function createBatchNode(node) {
    const id = uuidV4()

    return {
        id,
        [CALL_API]: {
            types: [ CREATE_BATCH_NODE_REQUEST, CREATE_BATCH_NODE_SUCCESS, CREATE_BATCH_NODE_FAILURE ],
            endpoint: 'Node.createBatchNode',
            payload: [ id, node || defaultNode ],
            schema: Schemas.NODE
        }
    }
}

export const CLEAR_BATCH_NODES_REQUEST = 'CLEAR_BATCH_NODES_REQUEST'
export const CLEAR_BATCH_NODES_SUCCESS = 'CLEAR_BATCH_NODES_SUCCESS'
export const CLEAR_BATCH_NODES_FAILURE = 'CLEAR_BATCH_NODES_FAILURE'

export function clearBatchNodes() {
    return {
        [CALL_API]: {
            types: [ CLEAR_BATCH_NODES_REQUEST, CLEAR_BATCH_NODES_SUCCESS, CLEAR_BATCH_NODES_FAILURE ],
            endpoint: 'Node.clearBatchNodes',
        }
    }
}



/*
 * Get a node by id including its neighbours and the connections between them
*/
export const GET_NODE_L1_REQUEST = 'GET_NODE_L1_REQUEST'
export const GET_NODE_L1_SUCCESS = 'GET_NODE_L1_SUCCESS'
export const GET_NODE_L1_FAILURE = 'GET_NODE_L1_FAILURE'
export function fetchNodeL1(id, collectionId) {
    return {
        id,
        sourceCollectionId: collectionId,
        [CALL_API]: {
            types: [ GET_NODE_L1_REQUEST, GET_NODE_L1_SUCCESS, GET_NODE_L1_FAILURE ],
            endpoint: 'Node.getWithNeighbours',
            payload: [ id ],
            schema: {
                node: Schemas.NODE,
                connectedNodes: arrayOf(Schemas.NODE),
                edges: arrayOf(Schemas.EDGE),
                collections: arrayOf(Schemas.COLLECTION),
            },
        }
    }
}
export function loadNodeL1(id, collectionId) {
    return (dispatch, getState) => {
        return dispatch(fetchNodeL1(id, collectionId))
    }
}


/*
 * Get a node by id including its neighbours and the connections between them
*/
export const GET_NODE_L2_REQUEST = 'GET_NODE_L2_REQUEST'
export const GET_NODE_L2_SUCCESS = 'GET_NODE_L2_SUCCESS'
export const GET_NODE_L2_FAILURE = 'GET_NODE_L2_FAILURE'
export function fetchNodeL2(id) {
    return {
        [CALL_API]: {
            types: [ GET_NODE_L2_REQUEST, GET_NODE_L2_SUCCESS, GET_NODE_L2_FAILURE ],
            endpoint: 'Node.getL2',
            payload: [ id ],
            schema: {
                node: Schemas.NODE,
                connectedNodes: arrayOf(Schemas.NODE),
                edges: arrayOf(Schemas.EDGE),
                collections: arrayOf(Schemas.COLLECTION),
            },
        }
    }
}
export function loadNodeL2(id, refresh=true) {
    return (dispatch, getState) => {
        const node = getNode(getState())

        // TODO: handle the case when we got this node earlier as a neighbouring edge - 2016-06-19
        // if (node && !refresh) {
        //     return null
        // }

        return dispatch(fetchNodeL2(id))
    }
}

/*
 * Get a node by id
*/
export const GET_NODE_REQUEST = 'GET_NODE_REQUEST'
export const GET_NODE_SUCCESS = 'GET_NODE_SUCCESS'
export const GET_NODE_FAILURE = 'GET_NODE_FAILURE'
export function fetchNode(id) {
    return {
        [CALL_API]: {
            types: [ GET_NODE_REQUEST, GET_NODE_SUCCESS, GET_NODE_FAILURE ],
            endpoint: 'Node.get',
            payload: [ id ],
            schema: {
                node: Schemas.NODE,
                collections: arrayOf(Schemas.COLLECTION),
            },
        }
    }
}
export function loadNode(id, refresh=true) {
    return (dispatch, getState) => {
        const node = getNode(getState())

        // TODO: handle the case when we got this node earlier as a neighbouring edge - 2016-06-19

        if (node && !refresh) {
            return null
        }

        return dispatch(fetchNode(id))
    }
}


/*
 * Get a node by id
*/
export const GET_INBOX_NODES_REQUEST = 'GET_INBOX_NODES_REQUEST'
export const GET_INBOX_NODES_SUCCESS = 'GET_INBOX_NODES_SUCCESS'
export const GET_INBOX_NODES_FAILURE = 'GET_INBOX_NODES_FAILURE'
export function fetchInboxNodes() {
    return {
        [CALL_API]: {
            types: [ GET_INBOX_NODES_REQUEST, GET_INBOX_NODES_SUCCESS, GET_INBOX_NODES_FAILURE ],
            endpoint: 'Node.getInboxNodes',
            schema: {
                nodes: arrayOf(Schemas.NODE),
            },
        }
    }
}
export function loadInboxNodes(id, refresh=true) {
    return (dispatch, getState) => {
        return dispatch(fetchInboxNodes())
    }
}



/*
 * Create a node
*/
export const CREATE_NODE_REQUEST = 'CREATE_NODE_REQUEST'
export const CREATE_NODE_SUCCESS = 'CREATE_NODE_SUCCESS'
export const CREATE_NODE_FAILURE = 'CREATE_NODE_FAILURE'
const defaultNode = {
    name: 'Untitled',
    content: '',
}
export function createNode(node) {
    const id = uuidV4()

    return {
        id,
        [CALL_API]: {
            types: [ CREATE_NODE_REQUEST, CREATE_NODE_SUCCESS, CREATE_NODE_FAILURE ],
            endpoint: 'Node.create',
            payload: [ id, node || defaultNode ],
            schema: Schemas.NODE
        }
    }
}

/*
 * Update a node, without changing relations
*/

export const UPDATE_NODE_REQUEST = 'UPDATE_NODE_REQUEST'
export const UPDATE_NODE_SUCCESS = 'UPDATE_NODE_SUCCESS'
export const UPDATE_NODE_FAILURE = 'UPDATE_NODE_FAILURE'

export function updateNode(id, properties) {
    return {
        id,
        [CALL_API]: {
            types: [ UPDATE_NODE_REQUEST, UPDATE_NODE_SUCCESS, UPDATE_NODE_FAILURE ],
            endpoint: 'Node.update',
            payload: [ id, properties ],
            schema: Schemas.NODE
        }
    }
}


/*
 * Remove a node, without changing relations
*/
export const REMOVE_NODE_REQUEST = 'REMOVE_NODE_REQUEST'
export const REMOVE_NODE_SUCCESS = 'REMOVE_NODE_SUCCESS'
export const REMOVE_NODE_FAILURE = 'REMOVE_NODE_FAILURE'
export function removeNode(nodeId, sourceCollectionId) {
    return {
        nodeId,
        collectionId: sourceCollectionId,
        [CALL_API]: {
            types: [ REMOVE_NODE_REQUEST, REMOVE_NODE_SUCCESS, REMOVE_NODE_FAILURE ],
            endpoint: 'Node.remove',
            payload: [ nodeId ],
            // schema: Schemas.NODE
        }
    }
}

/*
 * Duplicate a node, without changing relations
*/
export const DUPLICATE_NODE_REQUEST = 'DUPLICATE_NODE_REQUEST'
export const DUPLICATE_NODE_SUCCESS = 'DUPLICATE_NODE_SUCCESS'
export const DUPLICATE_NODE_FAILURE = 'DUPLICATE_NODE_FAILURE'
export function duplicateNode(id, isBatch=false) {
    return {
        nodeId: id,
        isBatch,
        [CALL_API]: {
            types: [ DUPLICATE_NODE_REQUEST, DUPLICATE_NODE_SUCCESS, DUPLICATE_NODE_FAILURE ],
            endpoint: 'Node.duplicate',
            payload: [ id, isBatch ],
            schema: Schemas.NODE,
        }
    }
}


/*
 * Add a shallow relation between two nodes
*/
export const CONNECT_NODES_REQUEST = 'CONNECT_NODES_REQUEST'
export const CONNECT_NODES_SUCCESS = 'CONNECT_NODES_SUCCESS'
export const CONNECT_NODES_FAILURE = 'CONNECT_NODES_FAILURE'

export function fetchConnectNodes(start, end, sourceCollectionId) {
    const id = uuidV4();

    return {
        start,
        end,
        sourceCollectionId,
        [CALL_API]: {
            types: [ CONNECT_NODES_REQUEST, CONNECT_NODES_SUCCESS, CONNECT_NODES_FAILURE ],
            endpoint: 'Node.connect',
            payload: [ start, end, id ],
            schema: Schemas.EDGE,
        }
    }
}
export function connectNodes(start, end, sourceCollectionId) {
    /*
     * we must first fetch the node, so we get its properties and show name and description
    */
    return (dispatch, getState) => {

        return dispatch(fetchConnectNodes(start, end, sourceCollectionId))
        // return dispatch(fetchNode(end))
        //     .then(() => dispatch(fetchConnectNodes(start, end)))
    }
}


/*
 * Add a shallow relation between two collections
*/
export const CONNECT_COLLECTIONS_REQUEST = 'CONNECT_COLLECTIONS_REQUEST'
export const CONNECT_COLLECTIONS_SUCCESS = 'CONNECT_COLLECTIONS_SUCCESS'
export const CONNECT_COLLECTIONS_FAILURE = 'CONNECT_COLLECTIONS_FAILURE'
export function fetchConnectCollections(start, end, id) {
    // const id = uuidV4();

    return {
        id,
        start,
        end,
        [CALL_API]: {
            types: [ CONNECT_COLLECTIONS_REQUEST, CONNECT_COLLECTIONS_SUCCESS, CONNECT_COLLECTIONS_FAILURE ],
            endpoint: 'Collection.connect',
            payload: [ start, end, id ],
            schema: Schemas.COLLECTION_EDGE,
        }
    }
}
export function connectCollections(start, end, id) {
    /*
     * we must first fetch the collection, so we get its properties and show name and description
    */
    // TODO: check if end/start is already cached - 2016-07-18
    return (dispatch) => {
        return dispatch(fetchConnectCollections(start, end, id))
        // return dispatch(direction === "to" ? fetchCollection(end) : fetchCollection(start))
        //     .then(() => dispatch(fetchConnectCollections(start, end)))
    }
}


/*
 * Add a detailed (with content relation between two nodes
*/
export const ADD_EDGE_REQUEST = 'ADD_EDGE_REQUEST'
export const ADD_EDGE_SUCCESS = 'ADD_EDGE_SUCCESS'
export const ADD_EDGE_FAILURE = 'ADD_EDGE_FAILURE'

export function fetchAddEdge(start, end, content, inGraphView=false) {
    const id = uuidV4();

    return {
        start,
        end,
        content,
        inGraphView,
        [CALL_API]: {
            types: [ ADD_EDGE_REQUEST, ADD_EDGE_SUCCESS, ADD_EDGE_FAILURE ],
            endpoint: 'Node.addEdge',
            payload: [ start, end, id, content ],
            schema: Schemas.EDGE,
        }
    }
}


export function addEdge(start, end, content, direction="to", inGraphView=false) {
    /*
     * we must first fetch the node, so we get its properties and show name and description
     *
    */
    return (dispatch) => {
        return dispatch(direction === "to" ? fetchNode(end) : fetchNode(start))
            .then(() => dispatch(fetchAddEdge(start, end, content, inGraphView)))
    }
}

/*
 * Remove a relation from node with id ${id}
*/

export const REMOVE_EDGE_REQUEST = 'REMOVE_EDGE_REQUEST'
export const REMOVE_EDGE_SUCCESS = 'REMOVE_EDGE_SUCCESS'
export const REMOVE_EDGE_FAILURE = 'REMOVE_EDGE_FAILURE'
export function fetchRemoveEdge(id, start, end) {
    // i need to know the from. and to properties of the edge, how to pass?
    return {
        id,
        start,
        end,
        [CALL_API]: {
            types: [ REMOVE_EDGE_REQUEST, REMOVE_EDGE_SUCCESS, REMOVE_EDGE_FAILURE ],
            endpoint: 'Node.removeEdge',
            payload: id,
        }
    }
}
export function removeEdge(id) {
    // i need to know the from. and to properties of the edge, how to pass?
    return (dispatch, getState) => {
        // get from, to edge id's then dispatch them to fetchRemoveEdge
        const edge = getEdge(getState(), id)
        const start = edge.start
        const end = edge.end

        return dispatch(fetchRemoveEdge(id, start, end))
    }
}

/*
 * Remove a relation from collection with id ${id}
*/

export const REMOVE_COLLECTION_EDGE_REQUEST = 'REMOVE_COLLECTION_EDGE_REQUEST'
export const REMOVE_COLLECTION_EDGE_SUCCESS = 'REMOVE_COLLECTION_EDGE_SUCCESS'
export const REMOVE_COLLECTION_EDGE_FAILURE = 'REMOVE_COLLECTION_EDGE_FAILURE'
export function fetchRemoveCollectionEdge(id, start, end) {
    // i need to know the from. and to properties of the edge, how to pass?
    return {
        id,
        start,
        end,
        [CALL_API]: {
            types: [ REMOVE_COLLECTION_EDGE_REQUEST, REMOVE_COLLECTION_EDGE_SUCCESS, REMOVE_COLLECTION_EDGE_FAILURE ],
            endpoint: 'Collection.removeEdge',
            payload: id,
        }
    }
}
export function removeCollectionEdge(id) {
    // i need to know the from. and to properties of the edge, how to pass?

    return (dispatch, getState) => {
        // get from, to edge id's then dispatch them to fetchRemoveCollectionEdge
        const edge = getCollectionEdge(getState(), id)
        const start = edge.start
        const end = edge.end

        return dispatch(fetchRemoveCollectionEdge(id, start, end))
    }
}


/*
 * Get all collections
*/
export const GET_COLLECTIONS_REQUEST = 'GET_COLLECTIONS_REQUEST'
export const GET_COLLECTIONS_SUCCESS = 'GET_COLLECTIONS_SUCCESS'
export const GET_COLLECTIONS_FAILURE = 'GET_COLLECTIONS_FAILURE'
export function fetchCollections() {
    return {
        [CALL_API]: {
            types: [ GET_COLLECTIONS_REQUEST, GET_COLLECTIONS_SUCCESS, GET_COLLECTIONS_FAILURE ],
            endpoint: 'Collection.getAll',
            schema: {
                collections: Schemas.COLLECTION_ARRAY,
                edges: arrayOf(Schemas.COLLECTION_EDGE)
            }
        }
    }
}


/*
 * Get all collection
*/
export const GET_COLLECTION_REQUEST = 'GET_COLLECTION_REQUEST'
export const GET_COLLECTION_SUCCESS = 'GET_COLLECTION_SUCCESS'
export const GET_COLLECTION_FAILURE = 'GET_COLLECTION_FAILURE'

export function fetchCollection(id) {
    return {
        [CALL_API]: {
            types: [ GET_COLLECTION_REQUEST, GET_COLLECTION_SUCCESS, GET_COLLECTION_FAILURE ],
            endpoint: 'Collection.get',
            payload: [ id ],
            // schema: Schemas.COLLECTION,
            schema: {
                collection: Schemas.COLLECTION,
                // nodes: arrayOf(Schemas.NODE),
                edges: arrayOf(Schemas.EDGE),
            }
        }
    }
}
export function loadCollection(id, refresh=true) {
    /*
     * Load collection, including all the nodes
    */
    return (dispatch, getState) => {
        const collection = getCollection(getState())

        if (collection && !refresh) {
            return null
        }

        return dispatch(fetchCollection(id))
    }
}


/*
 * Create a collection
*/
export const CREATE_COLLECTION_REQUEST = 'CREATE_COLLECTION_REQUEST'
export const CREATE_COLLECTION_SUCCESS = 'CREATE_COLLECTION_SUCCESS'
export const CREATE_COLLECTION_FAILURE = 'CREATE_COLLECTION_FAILURE'
export function createCollection(id, collection) {
    // const id = uuidV4();

    return {
        id,
        [CALL_API]: {
            types: [ CREATE_COLLECTION_REQUEST, CREATE_COLLECTION_SUCCESS, CREATE_COLLECTION_FAILURE ],
            endpoint: 'Collection.create',
            payload: [ id, collection ],
            schema: Schemas.COLLECTION
        }
    }
}


/*
 * Update a collection
*/
export const UPDATE_COLLECTION_REQUEST = 'UPDATE_COLLECTION_REQUEST'
export const UPDATE_COLLECTION_SUCCESS = 'UPDATE_COLLECTION_SUCCESS'
export const UPDATE_COLLECTION_FAILURE = 'UPDATE_COLLECTION_FAILURE'
export function updateCollection(id, properties) {
    return {
        [CALL_API]: {
            types: [ UPDATE_COLLECTION_REQUEST, UPDATE_COLLECTION_SUCCESS, UPDATE_COLLECTION_FAILURE ],
            endpoint: 'Collection.update',
            payload: [ id, properties ],
            schema: Schemas.COLLECTION
        }
    }
}

/*
 * Remove a collection
*/
export const REMOVE_COLLECTION_REQUEST = 'REMOVE_COLLECTION_REQUEST'
export const REMOVE_COLLECTION_SUCCESS = 'REMOVE_COLLECTION_SUCCESS'
export const REMOVE_COLLECTION_FAILURE = 'REMOVE_COLLECTION_FAILURE'
export function removeCollection(id) {
    return {
        collectionId: id,
        [CALL_API]: {
            types: [ REMOVE_COLLECTION_REQUEST, REMOVE_COLLECTION_SUCCESS, REMOVE_COLLECTION_FAILURE ],
            endpoint: 'Collection.remove',
            payload: [ id ],
            // schema: Schemas.COLLECTION
        }
    }
}


/*
 * add node with id ${nodeId} to collection with id ${collectionId}
*/
export const ADD_NODE_TO_COLLECTION_REQUEST = 'ADD_NODE_TO_COLLECTION_REQUEST'
export const ADD_NODE_TO_COLLECTION_SUCCESS = 'ADD_NODE_TO_COLLECTION_SUCCESS'
export const ADD_NODE_TO_COLLECTION_FAILURE = 'ADD_NODE_TO_COLLECTION_FAILURE'
export function fetchAddNodeToCollection(collectionId, nodeId, abstractionChain) {
    const id = uuidV4();

    return {
        collectionId,
        nodeId,
        abstractionChain,
        [CALL_API]: {
            types: [ ADD_NODE_TO_COLLECTION_REQUEST, ADD_NODE_TO_COLLECTION_SUCCESS, ADD_NODE_TO_COLLECTION_FAILURE ],
            endpoint: 'Collection.addNode',
            payload: [ collectionId, nodeId, id ],
            schema: {
                collection: Schemas.COLLECTION,
                // node: Schemas.NODE, // update collection array
            },
        }
    }
}
export function addNodeToCollection(collectionId, nodeId) {
    /*
     * Check if we have node in cache already, if not, fetch it first
     * case 1: new node, no need to fetch neighbours
     * case 2: existing node, need to add neighbours
    */
    return (dispatch, getState) => {
        const collection = getCollection(getState(), collectionId)
        const node = getNode(getState(), nodeId)

        const abstractionChain = getAbstractionChain(getState(), collectionId)

        const collectionPromise = !collection ? dispatch(fetchCollection(collectionId)) : Promise.resolve(collection)
        // this fetches the neighbours as well (why?)
        const nodePromise = !node ? dispatch(loadNodeL1(nodeId)) : Promise.resolve(node)

        return Promise.all([ collectionPromise, nodePromise ])
            .then(() => dispatch(fetchAddNodeToCollection(collectionId, nodeId, abstractionChain)))
    }

}

/*
 * remove node with id ${nodeId} from collection with id ${collectionId}
*/
export const REMOVE_NODE_FROM_COLLECTION_REQUEST = 'REMOVE_NODE_FROM_COLLECTION_REQUEST'
export const REMOVE_NODE_FROM_COLLECTION_SUCCESS = 'REMOVE_NODE_FROM_COLLECTION_SUCCESS'
export const REMOVE_NODE_FROM_COLLECTION_FAILURE = 'REMOVE_NODE_FROM_COLLECTION_FAILURE'
export function removeNodeFromCollection(collectionId, nodeId) {
    return {
        collectionId,
        nodeId,
        [CALL_API]: {
            types: [ REMOVE_NODE_FROM_COLLECTION_REQUEST, REMOVE_NODE_FROM_COLLECTION_SUCCESS, REMOVE_NODE_FROM_COLLECTION_FAILURE ],
            endpoint: 'Collection.removeNode',
            payload: [ collectionId, nodeId ],
            // schema: {
            //     collection: Schemas.COLLECTION,
            //     node: Schemas.NODE, // update collection array
            // },
        }
    }
}

/*
 * Search a node
*/
export const SEARCH_NODE_REQUEST = 'SEARCH_NODE_REQUEST'
export const SEARCH_NODE_SUCCESS = 'SEARCH_NODE_SUCCESS'
export const SEARCH_NODE_FAILURE = 'SEARCH_NODE_FAILURE'

export function searchNode(query) {
    return {
        [CALL_API]: {
            types: [ SEARCH_NODE_REQUEST, SEARCH_NODE_SUCCESS, SEARCH_NODE_FAILURE ],
            endpoint: 'Node.search',
            payload: [ query ],
            // schema: Schemas.NODE
        }
    }
}

/*
 * Search a collection
*/
export const SEARCH_COLLECTION_REQUEST = 'SEARCH_COLLECTION_REQUEST'
export const SEARCH_COLLECTION_SUCCESS = 'SEARCH_COLLECTION_SUCCESS'
export const SEARCH_COLLECTION_FAILURE = 'SEARCH_COLLECTION_FAILURE'

export function searchCollection(query) {
    return {
        [CALL_API]: {
            types: [ SEARCH_COLLECTION_REQUEST, SEARCH_COLLECTION_SUCCESS, SEARCH_COLLECTION_FAILURE ],
            endpoint: 'Collection.search',
            payload: [ query ],
            // schema: Schemas.COLLECTION
        }
    }
}
export const RESET_SEARCH_COLLECTION = 'RESET_SEARCH_COLLECTION'
export function resetSearchCollection() {
    return {
        type: RESET_SEARCH_COLLECTION
    }
}


/*
 * Search a node
*/
export const SEARCH_ALL_REQUEST = 'SEARCH_ALL_REQUEST'
export const SEARCH_ALL_SUCCESS = 'SEARCH_ALL_SUCCESS'
export const SEARCH_ALL_FAILURE = 'SEARCH_ALL_FAILURE'

export function searchAll(query) {
    return {
        [CALL_API]: {
            types: [ SEARCH_ALL_REQUEST, SEARCH_ALL_SUCCESS, SEARCH_ALL_FAILURE ],
            endpoint: 'Node.searchAll',
            payload: [ query ],
            // schema: Schemas.NODE
        }
    }
}

/*
 * upload a file
*/
export const ADD_FILE_REQUEST = 'ADD_FILE_REQUEST'
export const ADD_FILE_SUCCESS = 'ADD_FILE_SUCCESS'
export const ADD_FILE_FAILURE = 'ADD_FILE_FAILURE'

export function addFile(body) {
    // TODO: must call a REST API instead - 2016-11-23
    return {
        [CALL_REST_API]: {
            types: [ ADD_FILE_REQUEST, ADD_FILE_SUCCESS, ADD_FILE_FAILURE ],
            endpoint: '/upload',
            method: 'POST',
            payload: body,
            // schema: Schemas.NODE
        }
    }
}

/*
 * upload a file
*/
export const REMOVE_FILE_REQUEST = 'REMOVE_FILE_REQUEST'
export const REMOVE_FILE_SUCCESS = 'REMOVE_FILE_SUCCESS'
export const REMOVE_FILE_FAILURE = 'REMOVE_FILE_FAILURE'

export function removeFile(fileName) {
    // TODO: must call a REST API instead - 2016-11-23
    return {
        [CALL_REST_API]: {
            types: [ REMOVE_FILE_REQUEST, REMOVE_FILE_SUCCESS, REMOVE_FILE_FAILURE ],
            endpoint: '/upload/remove',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            payload: JSON.stringify({
                fileName,
            }),
            // schema: Schemas.NODE
        }
    }
}

export const CONVERT_NODE_TO_COLLECTION_REQUEST = 'CONVERT_NODE_TO_COLLECTION_REQUEST'
export const CONVERT_NODE_TO_COLLECTION_SUCCESS = 'CONVERT_NODE_TO_COLLECTION_SUCCESS'
export const CONVERT_NODE_TO_COLLECTION_FAILURE = 'CONVERT_NODE_TO_COLLECTION_FAILURE'
export function convertNodeToCollection(id) {
    /*
     * Should have some extra
    */

    return {
        id,
        [CALL_API]: {
            types: [ CONVERT_NODE_TO_COLLECTION_REQUEST, CONVERT_NODE_TO_COLLECTION_SUCCESS, CONVERT_NODE_TO_COLLECTION_FAILURE ],
            endpoint: 'Node.convertNodeToCollection',
            payload: [ id ],
            schema: Schemas.NODE,
        }
    }
}

export const CONVERT_COLLECTION_TO_NODE_REQUEST = 'CONVERT_COLLECTION_TO_NODE_REQUEST'
export const CONVERT_COLLECTION_TO_NODE_SUCCESS = 'CONVERT_COLLECTION_TO_NODE_SUCCESS'
export const CONVERT_COLLECTION_TO_NODE_FAILURE = 'CONVERT_COLLECTION_TO_NODE_FAILURE'
export function convertCollectionToNode(id) {

    return {
        id,
        [CALL_API]: {
            types: [ CONVERT_COLLECTION_TO_NODE_REQUEST, CONVERT_COLLECTION_TO_NODE_SUCCESS, CONVERT_COLLECTION_TO_NODE_FAILURE ],
            endpoint: 'Node.convertCollectionToNode',
            payload: [ id ],
            schema: Schemas.NODE,
        }
    }
}

export const MOVE_TO_ABSTRACTION_REQUEST = 'MOVE_TO_ABSTRACTION_REQUEST'
export const MOVE_TO_ABSTRACTION_SUCCESS = 'MOVE_TO_ABSTRACTION_SUCCESS'
export const MOVE_TO_ABSTRACTION_FAILURE = 'MOVE_TO_ABSTRACTION_FAILURE'
export function fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId) {
    return {
        sourceCollectionId,
        sourceId,
        targetId,
        edgeId,
        [CALL_API]: {
            types: [ MOVE_TO_ABSTRACTION_REQUEST, MOVE_TO_ABSTRACTION_SUCCESS, MOVE_TO_ABSTRACTION_FAILURE ],
            endpoint: 'Node.moveToAbstraction',
            payload: [ sourceCollectionId, sourceId, targetId, edgeId ],
            // schema: {
            //     node: Schemas.NODE,
            // },
        }
    }
}

/*
 * change the abstract edge to point to the given target collection
*/
export function moveToAbstraction(sourceCollectionId, sourceId, targetId) {
    const edgeId = uuidV4()

    return (dispatch, getState) => {
        const source = getNode(getState(), sourceId)
        const target = getNode(getState(), targetId)

        console.log(sourceId, targetId);

        // TODO: this should be converted to front-end manipulations with a "sync" method - 2017-07-20
        if (target.type === "node") {
            console.log("TYPE IS NODE", target);
            // first need to convert the target to a collection
            return dispatch(convertNodeToCollection(targetId))
                .then(() => dispatch(fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId)))
        } else {
            // can add node directly to the collection
            return dispatch(fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId))
        }
    }
}



export const REMOVE_ABSTRACTION_REQUEST = 'REMOVE_ABSTRACTION_REQUEST'
export const REMOVE_ABSTRACTION_SUCCESS = 'REMOVE_ABSTRACTION_SUCCESS'
export const REMOVE_ABSTRACTION_FAILURE = 'REMOVE_ABSTRACTION_FAILURE'
export function removeAbstraction(sourceCollectionId, collectionId) {
    /*
     * This converts the abstraction to a node and the edges to normal edges
    */
    return {
        sourceCollectionId,
        collectionId,
        [CALL_API]: {
            types: [ REMOVE_ABSTRACTION_REQUEST, REMOVE_ABSTRACTION_SUCCESS, REMOVE_ABSTRACTION_FAILURE ],
            endpoint: 'Node.removeAbstraction',
            payload: [ sourceCollectionId, collectionId ],
        }
    }
}
