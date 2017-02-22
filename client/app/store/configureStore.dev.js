import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import thunk from 'redux-thunk'
import promise from 'redux-promise'
import createLogger from 'redux-logger'

import createSocketMiddleware from '../middleware/api'
import restApiMiddleware from '../middleware/restApi'
import { batchStoreEnhancer, batchMiddleware } from '../middleware/batch'

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

  const enhancer = compose(
    // Middleware you want to use in development:
    // applyMiddleware(d1, d2, d3),
    // Required! Enable Redux DevTools with the monitors you chose
    applyMiddleware(batchMiddleware, thunk, promise, socketMiddleware, restApiMiddleware, logger),
    batchStoreEnhancer,
    DevTools.instrument(),
    // Optional. Lets you write ?debug_session=<key> in address bar to persist debug sessions
    persistState(getDebugSessionKey())
  );

  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      // return store.replaceReducer(require('../reducers').default/*.default if you use Babel 6+ */)
    }
    );
  }

  return store;
}
