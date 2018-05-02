/* @flow */

import { normalize, Schema, arrayOf } from 'normalizr'
const uuidV4 = require('uuid/v4');
import Schemas from '../schemas'
import { CALL_API } from '../middleware/api'

// import { Source, Annotation } from '../types'

import { getSource } from '../reducers/source'

import {
    fetchTypes,
    fetchAllTypes,
    syncTypes,
} from './types'

export function fetchSource(sourceId) {
    return (dispatch, getState) => {
        // TODO: check if it is cached  - 2018-05-01

        const source = getSource(getState())

        if (source) {
            return;
        }

        dispatch({
            [CALL_API]: {
                types: [ 
                    fetchTypes.request,
                    fetchTypes.success,
                    fetchTypes.failure,
                ],
                endpoint: 'Source.fetch',
                payload: [ sourceId ],
            }
        })
    }
}

export function fetchSources() {
    // TODO: handle pagination - 2018-04-30
    return {
        [CALL_API]: {
            types: [ 
                fetchAllTypes.request,
                fetchAllTypes.success,
                fetchAllTypes.failure,
            ],
            endpoint: 'Source.fetchAll',
        }
    }
}

export function addSource(source, file=null) {
    /*
     * Adds a source
    */

    const sourceId = uuidV4();

    return {
        type: syncTypes.ADD_SOURCE,
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

export function removeSource(sourceId) {
    /*
     * Adds an source to a source
    */
    return {
        type: syncTypes.REMOVE_SOURCE,
        sourceId,
    }
}


export function updateSource(sourceId, source) {
    /*
     * Updates an source to a source
    */

    return {
        type: syncTypes.UPDATE_SOURCE,
        sourceId,
        source: {
            ...source,
            synced: false,
        }
    }
}


export function addHighlight(sourceId, highlight) {
    /*
     * Adds an highlight to a source
    */

    const highlightId = uuidV4();

    return {
        type: syncTypes.ADD_HIGHLIGHT,
        sourceId,
        highlightId,
        highlight: {
            ...highlight,
            synced: false,
        }
    }
}


export function removeHighlight(sourceId, highlightId) {
    /*
     * Adds an highlight to a highlight
    */
    return {
        type: syncTypes.REMOVE_HIGHLIGHT,
        sourceId,
        highlightId,
    }
}

export function updateHighlight(sourceId, highlightId, highlight) {
    /*
     * Updates an highlight to a highlight
    */

    return {
        type: syncTypes.UPDATE_HIGHLIGHT,
        sourceId,
        highlightId,
        highlight: {
            ...highlight,
            synced: false,
        }
    }
}

