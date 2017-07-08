/* @flow */
import { createAction } from 'redux-actions'

export const SET_EDITOR_STATE = 'SET_EDITOR_STATE'
export const setEditorState = createAction('SET_EDITOR_STATE')

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'
export const resetErrorMessage = createAction('RESET_ERROR_MESSAGE')

export const SHOW_CONNECT_WINDOW = 'SHOW_CONNECT_WINDOW'
export function showConnectWindow(editorState) {
    return {
        type: SHOW_CONNECT_WINDOW,
        editorState,
    }
}

export const HIDE_CONNECT_WINDOW = 'HIDE_CONNECT_WINDOW'
export function hideConnectWindow() {
    return {
        type: HIDE_CONNECT_WINDOW,
    }
}


export const SHOW_ADD_RELATION_WINDOW = 'SHOW_ADD_RELATION_WINDOW'
export function showAddRelationWindow(nodeId, editorState=null) {
    return {
        type: SHOW_ADD_RELATION_WINDOW,
        windowProps: {
            nodeId,
            editorState,
        },
    }
}

export const SHOW_ADD_COLLECTION_RELATION_WINDOW = 'SHOW_ADD_COLLECTION_RELATION_WINDOW'
export function showAddCollectionRelationWindow(collectionId, editorState=null) {
    return {
        type: SHOW_ADD_COLLECTION_RELATION_WINDOW,
        windowProps: {
            collectionId,
            editorState,
        },
    }
}

export const HIDE_ADD_RELATION_WINDOW = 'HIDE_ADD_RELATION_WINDOW'
export function hideAddRelationWindow() {
    return {
        type: HIDE_ADD_RELATION_WINDOW,
    }
}

export const SHOW_ADD_NODE_TO_COLLECTION_WINDOW = 'SHOW_ADD_NODE_TO_COLLECTION_WINDOW'
export const showAddNodeToCollectionWindow = createAction(SHOW_ADD_NODE_TO_COLLECTION_WINDOW)
export const HIDE_ADD_NODE_TO_COLLECTION_WINDOW = 'HIDE_ADD_NODE_TO_COLLECTION_WINDOW'
export const hideAddNodeToCollectionWindow = createAction(HIDE_ADD_NODE_TO_COLLECTION_WINDOW)

export const SHOW_CREATE_COLLECTION_WINDOW = 'SHOW_CREATE_COLLECTION_WINDOW'
export const showCreateCollectionWindow = createAction('SHOW_CREATE_COLLECTION_WINDOW')
export const HIDE_CREATE_COLLECTION_WINDOW = 'HIDE_CREATE_COLLECTION_WINDOW'
export const hideCreateCollectionWindow = createAction('HIDE_CREATE_COLLECTION_WINDOW')

export const SHOW_ADD_PICTURE_WINDOW = 'SHOW_ADD_PICTURE_WINDOW'
export const showAddPictureWindow = createAction(SHOW_ADD_PICTURE_WINDOW)
export const HIDE_ADD_PICTURE_WINDOW = 'HIDE_ADD_PICTURE_WINDOW'
export const hideAddPictureWindow = createAction(HIDE_ADD_PICTURE_WINDOW)

export const SHOW_ADD_VIDEO_WINDOW = 'SHOW_ADD_VIDEO_WINDOW'
export const showAddVideoWindow = createAction(SHOW_ADD_VIDEO_WINDOW)
export const HIDE_ADD_VIDEO_WINDOW = 'HIDE_ADD_VIDEO_WINDOW'
export const hideAddVideoWindow = createAction(HIDE_ADD_VIDEO_WINDOW)

export const SHOW_ADD_AUDIO_WINDOW = 'SHOW_ADD_AUDIO_WINDOW'
export const showAddAudioWindow = createAction(SHOW_ADD_AUDIO_WINDOW)
export const HIDE_ADD_AUDIO_WINDOW = 'HIDE_ADD_AUDIO_WINDOW'
export const hideAddAudioWindow = createAction(HIDE_ADD_AUDIO_WINDOW)

export const SET_ACTIVE_COLLECTIONS = 'SET_ACTIVE_COLLECTIONS'
export function setActiveCollections(collectionIds) {
    return {
        type: SET_ACTIVE_COLLECTIONS,
        collectionIds
    }
}

export const SHOW_INBOX_SIDEBAR = 'SHOW_INBOX_SIDEBAR'
export const showInboxSidebar = createAction(SHOW_INBOX_SIDEBAR)

export const HIDE_INBOX_SIDEBAR = 'HIDE_INBOX_SIDEBAR'
export const hideInboxSidebar = createAction(HIDE_INBOX_SIDEBAR)


/*
 * Collection graph ui manipulation
*/
import { getCollection, getCollections, getCollectionEdges } from '../reducers'
import { MIN_NODE_RADIUS } from '../graph/constants'



export const TOGGLE_EDIT_MODE = 'TOGGLE_EDIT_MODE'
// export const toggleEditMode = createAction(TOGGLE_EDIT_MODE)
export function toggleEditMode(id) {
    return (dispatch, getState) => {
        const state = getState()
        const collections = getCollections(state)
        const editMode = !(state.graphUiState.mode === 'edit')

        // for every collection, create a "addCollectionNode" and a "addCollectionEdge
        // when clicked on, these nodes will expand to an actual node and put in "edit mode"
        let addCollectionNodes = {}
        let addCollectionEdges = {}
        // TODO: these should be created only once on initial fetch and hidden with a flag - 2017-06-19
        // and then updated on action changes

        if (editMode) {
            collections.forEach((node, index) => {
                const nodeId = uuidV4()
                const edgeId = uuidV4()

                const addCollectionNode = {
                    id: nodeId,
                    type: 'addCollection',
                    radius: 10,

                    // for later reference in ADD_COLLECTION
                    start: node.id,
                    edgeId,
                }
                const addCollectionEdge = {
                    id: edgeId,
                    type: 'addCollection',
                    start: node.id,
                    end: nodeId,
                }

                addCollectionNodes[nodeId] = addCollectionNode
                addCollectionEdges[edgeId] = addCollectionEdge
            })

        }
        return dispatch({
            type: TOGGLE_EDIT_MODE,
            editMode,
            addCollectionNodes,
            addCollectionEdges,
        })
    }
}




// set this collection in edit mode
export const SET_ACTIVE_COLLECTION = 'SET_ACTIVE_COLLECTION'
export function setActiveCollection(id) {
    return {
        type: SET_ACTIVE_COLLECTION,
        id,
    }
}

// set this node in edit mode
export const SET_ACTIVE_NODE = 'SET_ACTIVE_NODE'
export function setActiveNode(id) {
    return {
        type: SET_ACTIVE_NODE,
        id,
    }
}

// expand this collection
export const EXPAND_COLLECTION = 'EXPAND_COLLECTION'
export function expandCollection(id) {
    return {
        type: EXPAND_COLLECTION,
        id,
    }
}

// set this node in edit mode
export const SET_GRAPH_MODE = 'SET_GRAPH_MODE'
export function setGraphMode(mode: "view" | "edit" | "focus" | "expand") {
    return {
        type: SET_GRAPH_MODE,
        payload: mode,
    }
}


const uuidV4 = require('uuid/v4');

// add a new collection to the graph and put it in edit mode
export const ADD_COLLECTION = 'ADD_COLLECTION'
export function addCollection(addCollectionNode) {

    return {
        type: ADD_COLLECTION,
        id: addCollectionNode.id,
        start: addCollectionNode.start,
        edgeId: addCollectionNode.edgeId,
    }
}


// add a new node to the graph and put it in edit mode
export const ADD_NODE = 'ADD_NODE'
export function addNode(pos) {
    const id = uuidV4()

    return {
        type: ADD_NODE,
        id: id,
        pos,
    }
}
