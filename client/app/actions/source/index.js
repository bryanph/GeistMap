/* @flow */

import { normalize, Schema, arrayOf } from 'normalizr'
const uuidV4 = require('uuid/v4');

import { CALL_API } from '../../middleware/api'
import { getSource } from '../../reducers/source'

// import { Source, Annotation } from '../types'

import {
    fetchTypes,
    fetchAllTypes,
    syncTypes,
} from './types'

/*
 * Response schemas ( for use with normalizer)
*/

const SourceSchema = new Schema('sources', {
    idAttribute: 'id'
})
const HighlightSchema = new Schema('highlights', {
    idAttribute: 'id'
})

SourceSchema.define({
    highlights: arrayOf(HighlightSchema),
})

/*
 * actions
*/

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
                    fetchTypes.REQUEST,
                    fetchTypes.SUCCESS,
                    fetchTypes.FAILURE,
                ],
                endpoint: 'Source.fetch',
                payload: [ sourceId ],
                schema: SourceSchema,
            }
        })
    }
}

export function fetchSources() {
    // TODO: handle pagination - 2018-04-30
    return {
        [CALL_API]: {
            types: [ 
                fetchAllTypes.REQUEST,
                fetchAllTypes.SUCCESS,
                fetchAllTypes.FAILURE,
            ],
            endpoint: 'Source.fetchAll',
            schema: arrayOf(SourceSchema),
        }
    }
}

export function addSource(source, file=null) {
    /*
     * Adds a source
     * // TODO: make sure the file argument is not passed down - 2018-05-02
    */

    const sourceId = uuidV4();

    return {
        type: syncTypes.ADD_SOURCE,
        sourceId,
        source: {
            ...source,
            id: sourceId,
            uploaded: !Boolean(file),
        },
        localState: {
            file,
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

