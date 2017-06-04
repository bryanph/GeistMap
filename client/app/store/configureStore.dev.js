import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk'
import promise from 'redux-promise'
import { createLogger } from 'redux-logger'

import createSocketMiddleware from '../middleware/api'
import restApiMiddleware from '../middleware/restApi'
import { batchStoreEnhancer, batchMiddleware } from '../middleware/batch'
import { composeWithDevTools } from 'redux-devtools-extension';

function getDebugSessionKey() {
    // You can write custom logic here!
    // By default we try to read the key from ?debug_session=<key> in the address bar
    const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
    return (matches && matches.length > 0)? matches[1] : null;
}

import _socket from '../socket.js'

export default function configureStore(initialState) {
    // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
    // See https://github.com/rackt/redux/releases/tag/v3.1.0

    const socketMiddleware = createSocketMiddleware(_socket)
    const logger = createLogger({
        collapsed: true
    })

    const enhancer = composeWithDevTools(
        applyMiddleware(thunk, promise, socketMiddleware, restApiMiddleware, logger),
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
