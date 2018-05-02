import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk'
import promise from 'redux-promise'

import { createLogger } from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension';
import createSocketMiddleware from '../middleware/api'
import restApiMiddleware from '../middleware/restApi'
import { batchStoreEnhancer, batchMiddleware } from '../middleware/batch'
import createSyncMiddleware from '../middleware/sync'

import _socket from '../socket.js'

import { syncTypes as sourceSyncTypes } from '../actions/source/types'

export default function configureStore(initialState) {
    // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
    // See https://github.com/rackt/redux/releases/tag/v3.1.0

    // TODO: create for every API endpoint? - 2018-05-02
    const syncMiddleware = createSyncMiddleware(
        _socket,
        (action) => {
            return action.type in sourceSyncTypes
        },
        { namespace: "Source" }
    )



    const socketMiddleware = createSocketMiddleware(_socket)
    const logger = createLogger({
        collapsed: true
    })

    const enhancer = composeWithDevTools(
        applyMiddleware(thunk, promise, socketMiddleware, restApiMiddleware, syncMiddleware, logger),
    )

    const store = createStore(rootReducer, initialState, enhancer);

    // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
    // if (module.hot) {
    //   module.hot.accept('../reducers', () => {
    //     // return store.replaceReducer(require('../reducers').default/*.default if you use Babel 6+ */)
    //   }
    //   );
    // }

    return store;
}
