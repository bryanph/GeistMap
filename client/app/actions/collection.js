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

/*
 * add node with id ${nodeId} to collection with id ${collectionId}
*/
export const ADD_NODE_TO_COLLECTION_REQUEST = 'ADD_NODE_TO_COLLECTION_REQUEST'
export const ADD_NODE_TO_COLLECTION_SUCCESS = 'ADD_NODE_TO_COLLECTION_SUCCESS'
export const ADD_NODE_TO_COLLECTION_FAILURE = 'ADD_NODE_TO_COLLECTION_FAILURE'
export function fetchAddNodeToCollection(collectionId, nodeId, prevNodeId) {
    const newEdgeId = uuidV4();

    return {
        collectionId,
        nodeId,
        prevNodeId,
        [CALL_API]: {
            types: [ ADD_NODE_TO_COLLECTION_REQUEST, ADD_NODE_TO_COLLECTION_SUCCESS, ADD_NODE_TO_COLLECTION_FAILURE ],
            endpoint: 'Collection.addNode',
            payload: [ collectionId, nodeId, prevNodeId, newEdgeId ],
            // schema: Schemas.COLLECTION_EDGE,
        }
    }
}
export function addNodeToCollection(collectionId, nodeId, prevNodeId) {
    return (dispatch, getState) => {

        let collection = getNode(getState(), collectionId)
        let node = getNode(getState(), nodeId)

        // TODO just use fetchNode()
        const collectionPromise = !collection ? dispatch(fetchCollectionL1(collectionId)) : Promise.resolve(collection)
        const nodePromise = !node ? dispatch(loadNodeL1(nodeId)) : Promise.resolve(node)

        return Promise.all([ collectionPromise, nodePromise])
            .then(([collection, node]) => {
                if (!prevNodeId) {
                    // add to the end
                    prevNodeId = collection.children.length ? collection.children[collection.children.length-1] : collectionId
                }
                return dispatch(fetchAddNodeToCollection(collectionId, nodeId, prevNodeId))
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
export function fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, edgeId, prevNodeId, sourceNode) {
    return {
        sourceCollectionId,
        sourceId,
        targetId,
        prevNodeId,
        edgeId,
        sourceNode, // TODO: don't pass down?
        [CALL_API]: {
            types: [ MOVE_TO_ABSTRACTION_REQUEST, MOVE_TO_ABSTRACTION_SUCCESS, MOVE_TO_ABSTRACTION_FAILURE ],
            endpoint: 'Collection.moveNode',
            payload: [ sourceCollectionId, sourceId, targetId, prevNodeId, edgeId ],
            // schema: {
            //     node: Schemas.NODE,
            // },
        }
    }
}
/*
 * change the abstract edge to point to the given target collection
*/
export function moveToAbstraction(sourceCollectionId, sourceId, targetId, prevNodeId) {
    const newEdgeId = uuidV4()

    return (dispatch, getState) => {
        const sourceCollection = getNode(getState(), sourceCollectionId)
        const source = getNode(getState(), sourceId)
        const target = getNode(getState(), targetId)

        // TODO: check for recursive patterns - 2018-02-12
        // make sure that source is not already in the collection chain of target
        const parentIds = getParentIdsRecursive(getState(), { id: targetId })
        if (parentIds.includes(sourceId)) {
            console.error("recursive pattern detected")
            return;
        }
        if (!prevNodeId) {
            // add to the end
            prevNodeId = target.children.length ? target.children[target.children.length-1] : targetId
        }

        return dispatch(fetchMoveToAbstraction(sourceCollectionId, sourceId, targetId, newEdgeId, prevNodeId, source))
    }
}



