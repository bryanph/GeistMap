

export const fetchTypes = {
    "REQUEST": Symbol("FETCH_SOURCE_REQUEST"),
    "SUCCESS": Symbol("FETCH_SOURCE_SUCCESS"),
    "FAILURE": Symbol("FETCH_SOURCE_FAILURE"),
}


export const fetchallTypes = {
    "REQUEST": Symbol("FETCHALL_SOURCE_REQUEST"),
    "SUCCESS": Symbol("FETCHALL_SOURCE_SUCCESS"),
    "FAILURE": Symbol("FETCHALL_SOURCE_FAILURE"),
}

export const syncTypes = {
    "ADD_SOURCE": Symbol("ADD_SOURCE"),
    "REMOVE_SOURCE": Symbol("REMOVE_SOURCE"),
    "UPDATE_SOURCE": Symbol("UPDATE_SOURCE"),
    "ADD_HIGHLIGHT": Symbol("ADD_HIGHLIGHT"),
    "REMOVE_HIGHLIGHT": Symbol("REMOVE_HIGHLIGHT"),
    "UPDATE_HIGHLIGHT": Symbol("UPDATE_HIGHLIGHT"),
}
