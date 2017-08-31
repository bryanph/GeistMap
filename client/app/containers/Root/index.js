import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route} from "react-router-dom"
import App from '../../containers/App'

import configureStore from '../../store/configureStore';

const initialState = Object.assign({}, window.INITIAL_STATE)
const store = configureStore(initialState)

export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <BrowserRouter>
                    <Route path="/app" component={App} />
                </BrowserRouter>
            </Provider>
        )
    }
}

