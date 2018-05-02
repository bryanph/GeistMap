import { Schema, arrayOf, normalize } from 'normalizr'
import { wrapPromise } from '../utils/promise.js'

import { isDisconnected } from '../reducers/socketState'

export const SYNC_START = "SYNC_START";
export const SYNC_COMMIT = "SYNC_COMMIT";
export const SYNC_ROLLBACK = "SYNC_ROLLBACK";

// user actions
export const SYNC_RETRY = "SYNC_RETRY";
export const SYNC_UNDO = "SYNC_UNDO";
export const SYNC_REDO = "SYNC_REDO";


export default function createSyncMiddleware(_socket, shouldSync, options={}) {
    /*
     * getActions: gets actions to sync from the state
     */

    const { namespace } = options;

    const syncEndpoint = namespace ? `${namespace}.sync` : "sync"

    let syncQueue = []; // actions currently being synced
    let actionQueue = []; // actions to sync

    let syncTimeout = null;
    let syncInterval = 2000; // ms
    let isFailing = false;
    let isSyncing = false;

    return store => next => {

        function syncActions() {
            // TODO: handle socket disconnection - 2018-05-02

            if (isSyncing || isFailing || isDisconnected(store.getState())) {
                return;
            }

            isSyncing = true;
            syncQueue = [ ...actionQueue ]
            actionQueue = []

            next({ type: SYNC_START, payload: actionQueue })

            _socket.emit(syncEndpoint, syncQueue)
                .then(
                    response => {
                        next({ type: SYNC_COMMIT, payload: syncQueue })

                        isSyncing = false;
                        syncQueue = [];

                        if (actionQueue.length) {
                            // actions were added whilst syncing: call syncActions again!
                            return syncActions(actionQueue)
                        }
                    },
                    error => {
                        // TODO: send details of which actions failed so they can be rolled back. - 2018-05-01
                        // TODO: first notify the user, then start retrying and queue upcoming actions - 2018-05-02
                        next({ type: SYNC_ROLLBACK, payload: error.failedActions })
                        isFailing = true;
                        isSyncing = false;
                    }
                )
        }

        return action => {
            // default behaviour
            next(action);

            if (action.type === SYNC_RETRY) {
                isFailing = false;
                syncActions()
            }

            // TODO: handle an undo and a redo action - 2018-05-02

            if (shouldSync(action)) {
                console.log("queueing action and calling shouldSync()", action)

                // TODO: blegh - 2018-05-02
                delete action["localState"]

                actionQueue.push(action)
                syncActions()
            }

        }

    } 

}
