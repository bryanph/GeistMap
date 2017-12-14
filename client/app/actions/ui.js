/* @flow */
import { createAction } from 'redux-actions'

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

export const SHOW_ARCHIVE_SIDEBAR = 'SHOW_ARCHIVE_SIDEBAR'
export const showArchiveSidebar = createAction(SHOW_ARCHIVE_SIDEBAR)

export const HIDE_ARCHIVE_SIDEBAR = 'HIDE_ARCHIVE_SIDEBAR'
export const hideArchiveSidebar = createAction(HIDE_ARCHIVE_SIDEBAR)

export const SHOW_ABSTRACTION_SIDEBAR = 'SHOW_ABSTRACTION_SIDEBAR'
export const showAbstractionSidebar = createAction(SHOW_ABSTRACTION_SIDEBAR)

export const HIDE_ABSTRACTION_SIDEBAR = 'HIDE_ABSTRACTION_SIDEBAR'
export const hideAbstractionSidebar = createAction(HIDE_ABSTRACTION_SIDEBAR)


/*
 * Collection graph ui manipulation
*/

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

// toggle the collapse for this collection
export const TOGGLE_COLLAPSE_COLLECTION = 'TOGGLE_COLLAPSE_COLLECTION'
export function toggleCollapse(id) {
    return {
        type: TOGGLE_COLLAPSE_COLLECTION,
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


export const MOVE_CHILD = 'MOVE_CHILD'
export const moveChild = createAction(MOVE_CHILD)

export const MOVE_PARENT = 'MOVE_PARENT'
export const moveParent = createAction(MOVE_PARENT)

export const RESET_ABSTRACTION_CHAIN = 'RESET_ABSTRACTION_CHAIN'
export const resetAbstractionChain = createAction(RESET_ABSTRACTION_CHAIN)
