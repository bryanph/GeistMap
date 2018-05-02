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

// TODO: separate - 2018-05-02
const SYNC_SUCCESS = "SYNC_SUCCESS"
const SYNC_FAILED = "SYNC_FAILED"

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

        // TODO: Instead, have one socket event for handling and make this more something like a reducer - 2018-05-02
        socket.on("Source.sync", (actions=[], res) => {
            // TODO: handling conflicts for simultaneous editing - 2018-05-02
            // when there are unapplied changes for the user, prepend actions to apply to response so the user can integrate these changes.

            function applyActionsInSequence(actions) {
                return actions.reduce((p, nextAction) => {
                    return p.then(() => userBoundSync(nextAction))
                }, Promise.resolve())
                    .then(() => SYNC_SUCCESS)
                    .catch(error => {
                        // TODO: when an error occurs, roll back and notify client that syncing failed - 2018-04-30
                        // TODO: commit should be all-or-nothing? - 2018-05-02

                        return SYNC_FAILED
                    })
            }

            applyActionsInSequence(actions)
                // TODO: communicate changes to other users - 2018-05-02
                .then((result) => handleSuccess(result, res))
                .catch((error) => handleError(error, res))
        })
    }
}
