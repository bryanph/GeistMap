import React, { Component } from 'react'
import { Provider } from 'react-redux'

import Router from '../../routes'

import configureStore from '../../store/configureStore';

const initialState = Object.assign({}, window.INITIAL_STATE)

const store = configureStore(initialState)

export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router />
            </Provider>
        )
    }
}

