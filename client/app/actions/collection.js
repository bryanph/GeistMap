import { normalize, Schema, arrayOf } from 'normalizr'
import Schemas from '../schemas'
import { CALL_API } from '../middleware/api'

import {
    getNode,
    getCollection,
    getParentIdsRecursive,
 } from '../reducers'

const uuidV4 = require('uuid/v4');

import { loadNodeL1 } from './node'

/*
 * Get collection, direct children and their neighbouring nodes (including edges)
*/
export const GET_COLLECTIONL1_REQUEST = 'GET_COLLECTIONL1_REQUEST'
export const GET_COLLECTIONL1_SUCCESS = 'GET_COLLECTIONL1_SUCCESS'
export const GET_COLLECTIONL1_FAILURE = 'GET_COLLECTIONL1_FAILURE'
export function fetchCollectionL1(id) {
    return {
        [CALL_API]: {
            types: [ GET_COLLECTIONL1_REQUEST, GET_COLLECTIONL1_SUCCESS, GET_COLLECTIONL1_FAILURE ],
            endpoint: 'Collection.getL1',
            payload: [ id ],
            schema: {
                nodes: arrayOf(Schemas.NODE),
                edges: arrayOf(Schemas.EDGE),
            }
        }
    }
}
export function loadCollectionL1(id) {
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

export const REMOVE_COLLECTION_REQUEST = 'REMOVE_COLLECTION_REQUEST'
export const REMOVE_COLLECTION_SUCCESS = 'REMOVE_COLLECTION_SUCCESS'
export const REMOVE_COLLECTION_FAILURE = 'REMOVE_COLLECTION_FAILURE'
export function fetchRemoveAbstraction(collectionId) {
    /*
     * This converts the abstraction to a node and the edges to normal edges
    */
    return {
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
        return dispatch(fetchCollectionL1(collectionId))
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
export function fetchAddNodeToCollection(collectionId, nodeId) {
    const id = uuidV4();

    return {
        collectionId,
        nodeId,
        [CALL_API]: {
            types: [ ADD_NODE_TO_COLLECTION_REQUEST, ADD_NODE_TO_COLLECTION_SUCCESS, ADD_NODE_TO_COLLECTION_FAILURE ],
            endpoint: 'Collection.addNode',
            payload: [ collectionId, nodeId, id ],
            // schema: Schemas.COLLECTION_EDGE,
        }
    }
}
export function addNodeToCollection(collectionId, nodeId) {
    /*
     * Check if we have node in cache already, if not, fetch it first
     * case 1: new node, no need to fetch neighbours
     * case 2: existing node, need to add neighbours
    */
    // TODO: should be tested separately - 2017-08-25
    // this makes sure the right state is present in order to be able to merge the resulting state
    return (dispatch, getState) => {
        let collection = getNode(getState(), collectionId)
        let node = getNode(getState(), nodeId)

        // TODO just use fetchNode()
        const collectionPromise = !collection ? dispatch(fetchCollectionL1(collectionId)) : Promise.resolve(collection)
        // const collectionPromise = dispatch(fetchCollectionL1(collectionId))
        // this fetches the neighbours as well (why?)
        const nodePromise = !node ? dispatch(loadNodeL1(nodeId)) : Promise.resolve(node)

        return Promise.all([ collectionPromise, nodePromise])
            .then(() => {
                return dispatch(fetchAddNodeToCollection(collectionId, nodeId))
            })

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
export function fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId, sourceNode) {
    return {
        sourceCollectionId,
        sourceId,
        targetId,
        edgeId,
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
export function moveToAbstraction(sourceCollectionId, sourceId, targetId) {
    const edgeId = uuidV4()

    return (dispatch, getState) => {
        const source = getNode(getState(), sourceId)
        const target = getNode(getState(), targetId)

        // TODO: check for recursive patterns - 2018-02-12
        // make sure that source is not already in the collection chain of target
        const parentIds = getParentIdsRecursive(getState(), { id: targetId })
        if (parentIds.includes(sourceId)) {
            console.error("recursive pattern detected")
            return;
        }

        return dispatch(fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId, source))
    }
}



