'use strict'

/*
 * css imports
 */
require('../scss/app.scss')
import 'semantic-ui-css/semantic.min.css';
import 'font-awesome/css/font-awesome.min.css'

import React, { Component } from 'react'
import ReactDom from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Route} from "react-router-dom"
import { AppContainer } from 'react-hot-loader'
// disable redbox-react
delete AppContainer.prototype.unstable_handleError

import App from './containers/App'
import configureStore from './store/configureStore';
import _socket, { wrapSocketEvents } from './socket'

/*
 * Configure the store
 */
const initialState = Object.assign({}, window.INITIAL_STATE)
const store = configureStore(initialState)

/*
 * Non-react store wrappers
 */
wrapSocketEvents(store)



export default class Root extends Component {
    render() {
        return (
            <AppContainer>
                <Provider store={store}>
                    <BrowserRouter>
                        <Route path="/app" component={App} />
                    </BrowserRouter>
                </Provider>
            </AppContainer>
        )
    }
}

const render = Component => {
    ReactDom.render(<Root />, document.getElementById('root'));
}

document.addEventListener('DOMContentLoaded', () => render(Root));


// if (module.hot) {
//     module.hot.accept('./containers/Root', () => { render(Root) })
// }
