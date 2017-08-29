import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'
import promise from 'redux-promise'

import createSocketMiddleware from '../middleware/api'
import restApiMiddleware from '../middleware/restApi'
import rootReducer from '../reducers'

export const createMockStore = (socket, initialState) => {
    const socketMiddleware = createSocketMiddleware(socket)
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk, promise, socketMiddleware, restApiMiddleware),
    );
}

