import { Schema, arrayOf, normalize } from 'normalizr'
import { wrapPromise } from '../utils/promise.js'

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

    _socket.emit = wrapPromise(_socket.emit.bind(_socket))
    _socket.on = wrapPromise(_socket.on.bind(_socket))

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

            next({ type: SYNC_START, actionQueue })

            _socket.emit(syncEndpoint, syncQueue)
                .then(
                    response => {
                        next({ type: SYNC_COMMIT, syncQueue })

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
                        next({ type: SYNC_ROLLBACK, error.failedActions })
                        isFailing = true;
                        isSyncing = false;
                    }
                )
        }

        return action => {

            if (action.type === SYNC_RETRY) {
                isFailing = false;
                syncActions()
            }

            // TODO: handle an undo and a redo action - 2018-05-02

            if (shouldSync(action)) {
                actionQueue.push(action)
                syncActions()
            }

            // default behaviour
            return next(action);
        }

    } 

}
