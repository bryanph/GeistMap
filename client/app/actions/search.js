import { normalize, Schema, arrayOf } from 'normalizr'
import Schemas from '../schemas'
import { CALL_API } from '../middleware/api'

/*
 * Search a node
*/
export const SEARCH_ALL_REQUEST = 'SEARCH_ALL_REQUEST'
export const SEARCH_ALL_SUCCESS = 'SEARCH_ALL_SUCCESS'
export const SEARCH_ALL_FAILURE = 'SEARCH_ALL_FAILURE'
export function searchAll(query) {
    return {
        [CALL_API]: {
            types: [ SEARCH_ALL_REQUEST, SEARCH_ALL_SUCCESS, SEARCH_ALL_FAILURE ],
            endpoint: 'Node.searchAll',
            payload: [ query ],
            // schema: Schemas.NODE
        }
    }
}
