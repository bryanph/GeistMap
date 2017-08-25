import { CALL_REST_API } from '../middleware/restApi'

/*
 * upload a file
*/
export const ADD_FILE_REQUEST = 'ADD_FILE_REQUEST'
export const ADD_FILE_SUCCESS = 'ADD_FILE_SUCCESS'
export const ADD_FILE_FAILURE = 'ADD_FILE_FAILURE'

export function addFile(body) {
    // TODO: must call a REST API instead - 2016-11-23
    return {
        [CALL_REST_API]: {
            types: [ ADD_FILE_REQUEST, ADD_FILE_SUCCESS, ADD_FILE_FAILURE ],
            endpoint: '/upload',
            method: 'POST',
            payload: body,
            // schema: Schemas.NODE
        }
    }
}

/*
 * upload a file
*/
export const REMOVE_FILE_REQUEST = 'REMOVE_FILE_REQUEST'
export const REMOVE_FILE_SUCCESS = 'REMOVE_FILE_SUCCESS'
export const REMOVE_FILE_FAILURE = 'REMOVE_FILE_FAILURE'

export function removeFile(fileName) {
    // TODO: must call a REST API instead - 2016-11-23
    return {
        [CALL_REST_API]: {
            types: [ REMOVE_FILE_REQUEST, REMOVE_FILE_SUCCESS, REMOVE_FILE_FAILURE ],
            endpoint: '/upload/remove',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            payload: JSON.stringify({
                fileName,
            }),
            // schema: Schemas.NODE
        }
    }
}

