'use strict'

require('../scss/app.scss')
require('../css/global.css')

import React from 'react'
import ReactDom from 'react-dom'
import { browserHistory } from "react-router"
import { syncHistoryWithStore } from 'react-router-redux'

import configureStore from './store/configureStore';

const initialState = Object.assign({}, window.INITIAL_STATE)

const store = configureStore(initialState)
const history = syncHistoryWithStore(browserHistory, store)

export default store

import Root from './containers/Root'

document.addEventListener('DOMContentLoaded', function () {
     ReactDom.render(
          <Root store={store} history={history} />,
          document.getElementById('app')
     );
});
