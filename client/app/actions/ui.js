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

export const SET_TITLE = 'SET_TITLE'
export function setTitle(title) {
    return {
        type: SET_TITLE,
        title,
    }
}

export const SHOW_INBOX_SIDEBAR = 'SHOW_INBOX_SIDEBAR'
export const showInboxSidebar = createAction(SHOW_INBOX_SIDEBAR)

export const HIDE_INBOX_SIDEBAR = 'HIDE_INBOX_SIDEBAR'
export const hideInboxSidebar = createAction(HIDE_INBOX_SIDEBAR)

