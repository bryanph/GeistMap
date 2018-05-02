
export const BATCH = 'ENHANCED_BATCHING.BATCH';
export const PUSH = 'ENHANCED_BATCHING.PUSH';
export const POP = 'ENHANCED_BATCHING.POP';

export function batchActions(actions) {
    return { type: BATCH, payload: actions };
}

export function batchMiddleware({ dispatch }) {
    return (next) =>
        (action) => {
            switch (action.type) {
                case BATCH: {
                    dispatch({ type: PUSH });
                    const returnArray = [];
                    action.payload.forEach((batchedAction) => {
                        returnArray.push(dispatch(batchedAction));
                    });
                    dispatch({ type: POP });
                    return returnArray;
                }
                default: {
                    return next(action);
                }
            }
        };
}

export function batchStoreEnhancer(next) {
    let currentListeners = [];
    let nextListeners = currentListeners;

    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice();
        }
    }

    function subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Expected listener to be a function.');
        }

        let isSubscribed = true;

        ensureCanMutateNextListeners();
        nextListeners.push(listener);

        return function unsubscribe() {
            if (!isSubscribed) {
                return;
            }

            isSubscribed = false;

            ensureCanMutateNextListeners();
            const index = nextListeners.indexOf(listener);
            nextListeners.splice(index, 1);
        };
    }

    function notifyListeners() {
        const listeners = currentListeners = nextListeners;
        for (let i = 0; i < listeners.length; i++) {
            listeners[i]();
        }
    }

    return (...args) => {
        const store = next(...args);
        const subscribeImmediate = store.subscribe;

        let batchDepth = 0;
        function dispatch(...dispatchArgs) {
            dispatchArgs.forEach((arg) => {
                if (arg.type) {
                    if (arg.type === PUSH) {
                        batchDepth += 1;
                    } else if (arg.type === POP) {
                        batchDepth -= 1;
                    }
                }
            });
            const res = store.dispatch(...dispatchArgs);
            if (batchDepth === 0) {
                notifyListeners();
            }
            return res;
        }

        return Object.assign({},
            store,
            dispatch,
            subscribe,
            subscribeImmediate,
        )
    };
}
