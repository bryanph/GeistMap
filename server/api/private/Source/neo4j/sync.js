/* @flow */

// TODO: this import should be done differently - 2018-04-30
const sourceActionTypes = require("../../../../../client/app/actions/source")

// initialization state
module.exports = function(db, es) {
    // connection state
    return function(user, socket) {

        function addSource(action) {

        }

        function updateSource(action) {

        }

        // api call state
        return function sync(action) {
            switch(action.type) {
                case sourceActionTypes.ADD_SOURCE:
                    return addSource(action);
                case sourceActionTypes.UPDATE_SOURCE:
                    return updateSource(action);
                case sourceActionTypes.REMOVE_SOURCE:
                    return removeSource(action);
                case sourceActionTypes.ADD_HIGHLIGHT:
                    return addHighlight(action);
                case sourceActionTypes.UPDATE_HIGHLIGHT:
                    return updateHighlight(action);
                case sourceActionTypes.REMOVE_HIGHLIGHT:
                    return removeHighlight(action);
                default: {
                    return Promise.reject(`unhandled action type ${action.type}`)
                }
            }
        }
    }
}

