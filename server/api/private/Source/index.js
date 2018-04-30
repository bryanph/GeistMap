"use strict"

const config = require('../../../config/config')
const { print, printTrace } = require('../../../utils/dev')

/*
 * Source: {
 *      type: [ pdf ]
 * }
 *
 * Annotation: {
 *      
 * }
 */

const createFetch = require("./neo4j/fetch")
const createFetchAll = require("./neo4j/fetchAll")
const createSync = require("./neo4j/sync")

const { handleSuccess, handleError } = require("../../util")

module.exports = function(db, es) {
    /*
     * initialized with
     * db: Neo4j database instance
     * es: Elasticsearch database instance
     */

    const fetch = createFetch(db, es);
    const fetchAll = createFetchAll(db, es);
    const sync = createSync(db, es);

    return (user, socket) => {
        const userBoundFetch = fetch(user, socket)
        const userBoundFetchAll = fetchAll(user, socket)
        const userBoundSync = sync(user, socket)

        socket.on("Source.fetch", (action, res) => {
            return userBoundFetch(action)
                .then((result) => handleSuccess(result, res))
                .catch((error) => handleError(error, res))
        })

        socket.on("Source.fetchAll", (res) => {
            return userBoundFetchAll()
                .then((result) => handleSuccess(result, res))
                .catch((error) => handleError(error, res))
        })

        socket.on("Source.sync", (actions=[], res) => {
            function applyActionsInSequence(actions) {
                return actions.reduce((p, nextAction) => {
                    return p.then(() => userBoundSync(nextAction))
                }, Promise.resolve())
                    .then(() => SYNC_SUCCESS)
                    .catch(error => {
                        // TODO: when an error occurs, roll back and notify client that syncing failed - 2018-04-30

                        return SYNC_FAILED
                    })
            }

            applyActionsInSequence(actions)
                .then((result) => handleSuccess(result, res))
                .catch((error) => handleError(error, res))
        })
    }
}
