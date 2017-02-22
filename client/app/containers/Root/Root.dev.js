
import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import routes from '../../routes.js'
import DevTools from '../DevTools';

export default class Root extends Component {
  render() {
    const { store, history } = this.props

    return (
      <Provider store={store}>
          <div style={{height: '100%'}}>
              <Router history={history} routes={routes} />
              <DevTools />
          </div>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}
