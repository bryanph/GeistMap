import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk'
import promise from 'redux-promise'

import io from 'socket.io-client'

import createSocketMiddleware from '../middleware/api'
import restApiMiddleware from '../middleware/restApi'
import { batchStoreEnhancer, batchMiddleware } from '../middleware/batch'

import _socket from '../socket.js'

// Middleware you want to use in production:
// const enhancer = applyMiddleware(p1, p2, p3);
const enhancer = applyMiddleware(thunk);

export default function configureStore(initialState) {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0


  const socketMiddleware = createSocketMiddleware(_socket)

  const enhancer = compose(
    // Middleware you want to use in development:
    // applyMiddleware(d1, d2, d3),
    // Required! Enable Redux DevTools with the monitors you chose
    applyMiddleware(batchMiddleware, thunk, promise, socketMiddleware, restApiMiddleware),
    batchStoreEnhancer,
  );

  return createStore(rootReducer, initialState, enhancer);
};
