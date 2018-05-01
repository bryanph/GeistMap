/* @flow */

import { normalize, Schema, arrayOf } from 'normalizr'
const uuidV4 = require('uuid/v4');
import Schemas from '../schemas'
import { CALL_API } from '../middleware/api'

// import { Source, Annotation } from '../types'

export const FETCH_SOURCE_REQUEST = "FETCH_SOURCE_REQUEST"
export const FETCH_SOURCE_SUCCESS = "FETCH_SOURCE_SUCCESS"
export const FETCH_SOURCE_FAILURE = "FETCH_SOURCE_FAILURE"
export function fetchSource(sourceId) {
    return {
        [CALL_API]: {
            types: [ FETCH_SOURCE_REQUEST, FETCH_SOURCE_SUCCESS, FETCH_SOURCE_FAILURE ],
            endpoint: 'Source.fetch',
            payload: [ sourceId ],
        }
    }
}

export const FETCH_SOURCES_REQUEST = "FETCH_SOURCES_REQUEST"
export const FETCH_SOURCES_SUCCESS = "FETCH_SOURCES_SUCCESS"
export const FETCH_SOURCES_FAILURE = "FETCH_SOURCES_FAILURE"
export function fetchSources() {
    // TODO: handle pagination - 2018-04-30
    return {
        [CALL_API]: {
            types: [ FETCH_SOURCES_REQUEST, FETCH_SOURCES_SUCCESS, FETCH_SOURCES_FAILURE ],
            endpoint: 'Source.fetchAll',
        }
    }
}

export const ADD_SOURCE = 'ADD_SOURCE'
export function addSource(source, file=null) {
    /*
     * Adds a source
    */

    const sourceId = uuidV4();

    return {
        type: ADD_SOURCE,
        sourceId,
        file,
        source: {
            ...source,
            id: sourceId,
            file,
            uploaded: !Boolean(file),
            synced: false,
        }
    }
}

export const REMOVE_SOURCE = 'REMOVE_SOURCE'
export function removeSource(sourceId) {
    /*
     * Adds an source to a source
    */
    return {
        type: REMOVE_SOURCE,
        sourceId,
    }
}


export const UPDATE_SOURCE = 'UPDATE_SOURCE'
export function updateSource(sourceId, source) {
    /*
     * Updates an source to a source
    */

    return {
        type: UPDATE_SOURCE,
        sourceId,
        source: {
            ...source,
            synced: false,
        }
    }
}


export const ADD_HIGHLIGHT = 'ADD_HIGHLIGHT'
export function addHighlight(sourceId, highlight) {
    /*
     * Adds an highlight to a source
    */

    const highlightId = uuidV4();

    return {
        type: ADD_HIGHLIGHT,
        sourceId,
        highlightId,
        highlight: {
            ...highlight,
            synced: false,
        }
    }
}


export const REMOVE_HIGHLIGHT = 'REMOVE_HIGHLIGHT'
export function removeHighlight(sourceId, highlightId) {
    /*
     * Adds an highlight to a highlight
    */
    return {
        type: REMOVE_HIGHLIGHT,
        sourceId,
        highlightId,
    }
}


export const UPDATE_HIGHLIGHT = 'UPDATE_HIGHLIGHT'
export function updateHighlight(sourceId, highlightId, highlight) {
    /*
     * Updates an highlight to a highlight
    */

    return {
        type: UPDATE_HIGHLIGHT,
        sourceId,
        highlightId,
        highlight: {
            ...highlight,
            synced: false,
        }
    }
}

