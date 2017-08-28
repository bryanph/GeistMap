import { normalize, Schema, arrayOf } from 'normalizr'
import Schemas from '../schemas'
import { CALL_API } from '../middleware/api'

import {
    getNode,
    getCollection,
 } from '../reducers'

const uuidV4 = require('uuid/v4');

import { convertNodeToCollection } from './node'

/*
 * Get all collections
*/
export const GET_COLLECTIONS_REQUEST = 'GET_COLLECTIONS_REQUEST'
export const GET_COLLECTIONS_SUCCESS = 'GET_COLLECTIONS_SUCCESS'
export const GET_COLLECTIONS_FAILURE = 'GET_COLLECTIONS_FAILURE'
export function fetchCollections() {
    /*
     * Fetches all abstractions and their Abstract edges
    */
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
 * get the collection and its children
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
            schema: {
                collection: Schemas.COLLECTION,
                // nodes: arrayOf(Schemas.NODE),
                edges: arrayOf(Schemas.EDGE),
            }
        }
    }
}

/*
 * Get collection, direct children and their neighbouring nodes (including edges)
*/
export const GET_COLLECTIONL1_REQUEST = 'GET_COLLECTIONL1_REQUEST'
export const GET_COLLECTIONL1_SUCCESS = 'GET_COLLECTIONL1_SUCCESS'
export const GET_COLLECTIONL1_FAILURE = 'GET_COLLECTIONL1_FAILURE'
export function fetchCollectionL1(id) {
    return {
        [CALL_API]: {
            types: [ GET_COLLECTION_REQUEST, GET_COLLECTION_SUCCESS, GET_COLLECTION_FAILURE ],
            endpoint: 'Collection.getL1',
            payload: [ id ],
            schema: {
                collection: Schemas.COLLECTION,
                // nodes: arrayOf(Schemas.NODE),
                edges: arrayOf(Schemas.EDGE),
            }
        }
    }
}
export function getCollectionL1(id, { cache = false } = {}) {
    /*
     * Check if we have node in cache already, if not, fetch it first
     * case 1: new node, no need to fetch neighbours
     * case 2: existing node, need to add neighbours
    */
    return (dispatch, getState) => {
        return dispatch(fetchCollectionL1(id))
        // const collection = getCollection(getState(), id)
        //
        // if (cache) {
        //     return !collection ? dispatch(fetchCollectionL1(id)) : Promise.resolve(collection)
        // }
        // else {
        //     return dispatch(fetchCollectionL1(id))
        // }
    }
}

/*
 * Create a collection
*/
export const CREATE_COLLECTION_REQUEST = 'CREATE_COLLECTION_REQUEST'
export const CREATE_COLLECTION_SUCCESS = 'CREATE_COLLECTION_SUCCESS'
export const CREATE_COLLECTION_FAILURE = 'CREATE_COLLECTION_FAILURE'
export function createCollection(id, parentId, data) {
    // const id = uuidV4();

    return {
        id,
        parentId,
        [CALL_API]: {
            types: [ CREATE_COLLECTION_REQUEST, CREATE_COLLECTION_SUCCESS, CREATE_COLLECTION_FAILURE ],
            endpoint: 'Collection.create',
            payload: [ id, parentId, data ],
            schema: Schemas.COLLECTION
        }
    }
}

export const REMOVE_COLLECTION_REQUEST = 'REMOVE_COLLECTION_REQUEST'
export const REMOVE_COLLECTION_SUCCESS = 'REMOVE_COLLECTION_SUCCESS'
export const REMOVE_COLLECTION_FAILURE = 'REMOVE_COLLECTION_FAILURE'
export function fetchRemoveAbstraction(collectionId) {
    /*
     * This converts the abstraction to a node and the edges to normal edges
    */
    return {
        sourceCollectionId,
        collectionId,
        [CALL_API]: {
            types: [ REMOVE_COLLECTION_REQUEST, REMOVE_COLLECTION_SUCCESS, REMOVE_COLLECTION_FAILURE ],
            endpoint: 'Collection.remove',
            payload: [ collectionId ],
        }
    }
}
export function removeAbstraction(collectionId) {
    /*
     * 1. Fetch direct child nodes of ${collectionId}
     * 2. Move abstraction with ${collectionId} to ${sourceCollectionId}
    */
    return (dispatch, getState) => {
        // get the direct child nodes,
        // TODO: must be merged with previous
        // TODO: should be getCollection?
        console.log(collectionId);
        return dispatch(getCollectionL1(collectionId))
            .then(() => {
                return dispatch(fetchRemoveAbstraction(collectionId))
            })
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
            schema: Schemas.COLLECTION_EDGE,
        }
    }
}
export function addNodeToCollection(collectionId, nodeId, currentAbstractionChain) {
    /*
     * Check if we have node in cache already, if not, fetch it first
     * case 1: new node, no need to fetch neighbours
     * case 2: existing node, need to add neighbours
    */
    // TODO: should be tested separately - 2017-08-25
    // this makes sure the right state is present in order to be able to merge the resulting state
    return (dispatch, getState) => {
        const collection = getCollection(getState(), collectionId)
        const node = getNode(getState(), nodeId)

        const collectionPromise = !collection ? dispatch(fetchCollectionL1(collectionId)) : Promise.resolve(collection)
        // this fetches the neighbours as well (why?)
        const nodePromise = !node ? dispatch(loadNodeL1(nodeId)) : Promise.resolve(node)

        return Promise.all([ collectionPromise, nodePromise ])
            .then(() => dispatch(fetchAddNodeToCollection(collectionId, nodeId, currentAbstractionChain)))
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
        }
    }
}


export const MOVE_TO_ABSTRACTION_REQUEST = 'MOVE_TO_ABSTRACTION_REQUEST'
export const MOVE_TO_ABSTRACTION_SUCCESS = 'MOVE_TO_ABSTRACTION_SUCCESS'
export const MOVE_TO_ABSTRACTION_FAILURE = 'MOVE_TO_ABSTRACTION_FAILURE'
export function fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId, abstractionChain, sourceNode) {
    return {
        sourceCollectionId,
        sourceId,
        targetId,
        edgeId,
        abstractionChain,
        sourceNode, // TODO: don't pass down?
        [CALL_API]: {
            types: [ MOVE_TO_ABSTRACTION_REQUEST, MOVE_TO_ABSTRACTION_SUCCESS, MOVE_TO_ABSTRACTION_FAILURE ],
            endpoint: 'Collection.moveNode',
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
export function moveToAbstraction(sourceCollectionId, sourceId, targetId, currentAbstractionChain) {
    const edgeId = uuidV4()

    return (dispatch, getState) => {
        const source = getNode(getState(), sourceId)
        const target = getNode(getState(), targetId)

        // TODO: this should be converted to front-end manipulations with a "sync" method - 2017-07-20
        if (target.type === "node") {
            // first need to convert the target to a collection
            return dispatch(convertNodeToCollection(targetId))
                .then(() => dispatch(fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId, currentAbstractionChain, source)))
        } else {
            // can add node directly to the collection
            return dispatch(fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId, currentAbstractionChain, source))
        }
    }
}



