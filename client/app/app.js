'use strict'

require('../scss/app.scss')
require('../css/global.css')

import React from 'react'
import ReactDom from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import configureStore from './store/configureStore';
import Root from './containers/Root'

const initialState = Object.assign({}, window.INITIAL_STATE)

const store = configureStore(initialState)

// TODO: get rid of this export - 2017-05-20
export default store

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(
        <AppContainer>
            <Root store={store} />
        </AppContainer>
        ,
        document.getElementById('app')
    );
});

// disable redbox-react
delete AppContainer.prototype.unstable_handleError

if (module.hot) {
    module.hot.accept('./containers/Root', () => {
        const NextApp = require('./containers/Root').default;
        ReactDOM.render(
            <AppContainer>
                <NextApp/>
            </AppContainer>,
            document.getElementById('root')
        );
    });
}
