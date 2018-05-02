/* @flow */

import { combineReducers } from 'redux'
import omit from 'lodash/omit'
import merge from 'lodash/merge'
import update from 'immutability-helper'

import {
    fetchTypes,
    fetchAllTypes,
    syncTypes,
} from '../actions/source/types'

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

    if (syncTypes[action.type]) {
            return [ ...state, action ]
    }

    return state;
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
        case fetchAllTypes.REQUEST:
            return update(state, {
                list: { $merge: {
                    status: FETCH_FETCHING,
                    error: null,
                }}
            })
        case fetchAllTypes.SUCCESS:
            return update(state, {
                list: { $merge: {
                    status: FETCH_SUCCESS,
                    visible: [ action.response.result ],
                    fetched: merge(state.list.fetched, listToTrueMap(action.response.result)),
                    error: null,
                }}
            })
        case fetchAllTypes.FAILURE:
            return update(state, {
                list: { $merge: {
                    status: FETCH_FAILURE,
                    error: action.error,
                }}
            })

        case fetchTypes.REQUEST:
            return update(state, {
                detail: { $merge: {
                    status: FETCH_FETCHING,
                    visible: action.id,
                    error: null,
                }}
            })
        case fetchTypes.SUCCESS:
            return update(state, {
                detail: { $merge: {
                    status: FETCH_SUCCESS,
                    fetched: merge(state.list.fetched, { [action.id]: true }),
                    error: null,
                }}
            })
        case fetchTypes.FAILURE:
            return update(state, {
                list: { $merge: {
                    status: FETCH_FAILURE,
                    error: action.error,
                }}
            })


        default:
            return state;
    }
} 

function sources(state={}, action) {
    switch(action.type) {

        case fetchAllTypes.SUCCESS: {
            return merge({}, state, action.response.entities.sources)
        }

        case syncTypes.ADD_SOURCE: {
            return update(state, {
                [action.sourceId]: { $set: {
                    ...action.source,
                    localState: action.localState
                }}
            })
        }
        case syncTypes.REMOVE_SOURCE: {
            // TODO: should also remove all the annotations - 2018-04-28
            return omit(state, action.sourceId)
        }
        case syncTypes.UPDATE_SOURCE: {
            return update(state, {
                [action.sourceId]: {$merge: action.source }
            })
        }

        case syncTypes.ADD_HIGHLIGHT: {
            return update(state, {
                [action.sourceId]: {
                    ...action.source,
                    highlights: { $push: [ action.highlightId ] }
                }
            })
        }
        case syncTypes.REMOVE_HIGHLIGHT: {
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
        // case fetchAllTypes.SUCCESS: {
        //     return merge({}, state, action.response.entities.highlights)
        // }

        case syncTypes.ADD_HIGHLIGHT: {
            return update(state, {
                [action.highlightId]: { $set: action.highlight }
            })
        }
        case syncTypes.REMOVE_HIGHLIGHT: {
            return omit(state, action.highlightId)
        }
        case syncTypes.UPDATE_HIGHLIGHT: {
            return update(state, {
                [action.highlightId]: {$merge: action.highlight }
            })
        }

        case syncTypes.REMOVE_SOURCE: {
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
    return state.sources.loadingStates.list.status === FETCH_SUCCESS
}

export function isLoadingList(state) {
    return state.sources.loadingStates.list.status === FETCH_FETCHING
}

export function isErrorList(state) {
    return state.sources.loadingStates.list.status === FETCH_ERROR
}


export function hasLoadedDetail(state) {
    return state.sources.loadingStates.detail.status === FETCH_SUCCESS
}

export function isLoadingDetail(state) {
    return state.sources.loadingStates.detail.status === FETCH_FETCHING
}

export function isErrorDetail(state) {
    return state.sources.loadingStates.detail.status === FETCH_ERROR
}


export function getSources(state) {
    // TODO: include pagination - 2018-04-30
    return Object.values(state.sources.sources)
}

export function getSource(state, id) {
    // also get annotations
    return state.sources.sources[id]
}
