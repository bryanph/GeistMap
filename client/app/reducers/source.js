/* @flow */

import { combineReducers } from 'redux'
import omit from 'lodash/omit'
import merge from 'lodash/merge'
import update from 'immutability-helper'

import * as sourceActionTypes from '../actions/source'

import {
    FETCH_INITIAL,
    FETCH_FETCHING,
    FETCH_SUCCESS,
    FETCH_FAILURE,
} from '../actions/loadingStates'

function sourceActions(state=[], action) {
    // TODO: make sure this list does not get too long - 2018-04-28
    // TODO: This list should only have actions that involve manipulations? - 2018-04-28
    // TODO: this list should be synced with the server - 2018-04-28

    switch(action.type) {
        case sourceActionTypes.ADD_SOURCE:
        case sourceActionTypes.REMOVE_SOURCE:
        case sourceActionTypes.UPDATE_SOURCE:
        case sourceActionTypes.ADD_HIGHLIGHT:
        case sourceActionTypes.REMOVE_HIGHLIGHT:
        case sourceActionTypes.UPDATE_HIGHLIGHT:
            return [ ...state, action ]

        default:
            return state;
    }
}

const initialLoadingState = {
    // TODO: this should also inhibit pagination - 2018-04-28
    // TODO: should also inhibit search - 2018-04-28
    list: {
        status: FETCH_INITIAL,
        error: null,
        visible: [], // the items visible right now (ordered)
        fetched: {}, // a map of the items that have been "list fetched", can be used for caching
    },
    detail: {
        status: FETCH_INITIAL,
        error: null,
        visible: null, // the item that is visible now
        fetched: {}, // a map of the items that have been "detail fetched"
    },
}

function listToTrueMap(list) {
    return list.reduce((map, id) => {
        map[id] = true
        return map;
    }, {})
}

function loadingStateReducer(state=initialLoadingState, action) {
    // TODO: also handle "fetch more" - 2018-04-28
    switch(action.type) {
        case sourceActionTypes.FETCH_SOURCES_REQUEST:
            return update(state, {
                list: { $merge: {
                    status: FETCH_FETCHING,
                    error: null,
                }}
            })
        case sourceActionTypes.FETCH_SOURCES_SUCCESS:
            console.log(action.response)
            return update(state, {
                list: { $merge: {
                    status: FETCH_SUCCESS,
                    visible: [ action.response.sources ],
                    fetched: merge(state.list.fetched, listToTrueMap(action.response)),
                    error: null,
                }}
            })
        case sourceActionTypes.FETCH_SOURCES_FAILURE:
            return update(state, {
                list: { $merge: {
                    status: FETCH_FAILURE,
                    error: error,
                }}
            })

        case sourceActionTypes.FETCH_SOURCE_REQUEST:
            return update(state, {
                detail: { $merge: {
                    status: FETCH_FETCHING,
                    visible: action.id,
                    error: null,
                }}
            })
        case sourceActionTypes.FETCH_SOURCE_SUCCESS:
            return update(state, {
                detail: { $merge: {
                    status: FETCH_SUCCESS,
                    fetched: merge(state.list.fetched, { [action.id]: true }),
                    error: null,
                }}
            })
        case sourceActionTypes.FETCH_SOURCE_FAILURE:
            return update(state, {
                list: { $merge: {
                    status: FETCH_FAILURE,
                    error: error,
                }}
            })


        default:
            return state;
    }
} 

function sources(state={}, action, globalState) {
    switch(action.type) {

        case sourceActionTypes.FETCH_SOURCES_SUCCESS: {
            return merge({}, state, action.response)
        }

        case sourceActionTypes.ADD_SOURCE: {
            return update(state, {
                [action.sourceId]: { $set: action.source }
            })
        }
        case sourceActionTypes.REMOVE_SOURCE: {
            // TODO: should also remove all the annotations - 2018-04-28
            return omit(state, action.sourceId)
        }
        case sourceActionTypes.UPDATE_SOURCE: {
            return update(state, {
                [action.sourceId]: {$merge: action.source }
            })
        }

        case sourceActionTypes.ADD_HIGHLIGHT: {
            return update(state, {
                [action.sourceId]: {
                    ...action.source,
                    highlights: { $push: [ action.highlightId ] }
                }
            })
        }
        case sourceActionTypes.REMOVE_HIGHLIGHT: {
            return update(state, {
                [action.sourceId]: {
                    ...action.source,
                    highlights: { $remove: [ action.highlightId ] }
                }
            })
        }

        default: {
            return state;
        }
    }
}


function highlights(state={}, sources, action) {
    // TODO: A highlight is linked to a single source no? - 2018-04-28

    switch(action.type) {
        // case sourceActionTypes.FETCH_SOURCES_SUCCESS: {
        //     return merge({}, state, action.response.entities.highlights)
        // }

        case sourceActionTypes.ADD_HIGHLIGHT: {
            return update(state, {
                [action.highlightId]: { $set: action.highlight }
            })
        }
        case sourceActionTypes.REMOVE_HIGHLIGHT: {
            return omit(state, action.highlightId)
        }
        case sourceActionTypes.UPDATE_HIGHLIGHT: {
            return update(state, {
                [action.highlightId]: {$merge: action.highlight }
            })
        }

        case sourceActionTypes.REMOVE_SOURCE: {
            // TODO: remove all highlights part of the source - 2018-04-28
            const source = sources[action.sourceId]
            return state;
        }

        default: {
            return state;
        }
    }
}

function rootReducer(state={}, action) {
    return  {
        loadingStates: loadingStateReducer(state.loadingStates, action),
        sourceActions: sourceActions(state.sourceActions, action),
        sources: sources(state.sources, action),
        highlights: highlights(state.highlights, sources, action),
    }
}

export default rootReducer

export function hasLoadedList(state) {
    console.log(state)
    return state.sources.loadingStates.list.status === FETCH_SUCCESS
}

export function isLoadingList(state) {
    return state.sources.loadingStates.list.status === FETCH_FETCHING
}

export function isErrorList(state) {
    return state.sources.loadingStates.list.status === FETCH_ERROR

}


export function getSources(state) {
    // TODO: include pagination - 2018-04-30
    return Object.values(state.sources.sources)
}
