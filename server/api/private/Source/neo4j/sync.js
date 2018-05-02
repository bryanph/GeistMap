/* @flow */

// TODO: this import should be done differently - 2018-04-30
const { syncTypes: sourceActionTypes } = require("../../../../../client/app/actions/source/types")

const validateSource = (source) => {
    // TODO: validate the source is well defined - 2018-05-01

    return source;
}

// initialization state
module.exports = function(db, es) {
    // connection state
    return function(user, socket) {

        function addSource(action) {
            /*
             * Create a new source with zero annotations
             */

            if (!action.source.name) {
                return Promise.reject("Set a title")
            }

            const validatedSource = validateSource(action.source)

            return db.run(`
                MATCH (u:User) WHERE u.id = {userId}
                CREATE (s:Source)<-[:AUTHOR]-(u)
                SET s = { data }
                RETURN properties(s) as source
                `,
                {
                    userId: user._id.toString(),
                    data: validatedSource,
                }
            )
            .then((results) => {
                const result =
                    Object.assign(results.records[0]._fields[0], {
                        annotations: []
                    })

                // TODO: index for full text search - 2018-05-01
                // // now update ES indexes
                // updateIndex(es, user._id.toString(), result)

                return result

            })
        }

        function updateSource(action) {
            /*
             * Update properties of node with id ${id}
             */

            const validatedSource = validateSource(action.source)

            return db.run(`
                MATCH (u:User)--(s:Source)
                WHERE u.id = {userId} AND s.id = {id}
                SET s += { data }
                RETURN properties(s) as source
                `,
                {
                    userId: user._id.toString(),
                    id: action.sourceId,
                    data: validatedSource,
                }
            )
            .then((results) => {
                const result = results.records[0]._fields[0]

                // now update ES indexes...
                // updateIndex(es, user._id.toString(), result)

                return result
            })
        }

        // api call state
        return function sync(action) {
            console.log(action)
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

