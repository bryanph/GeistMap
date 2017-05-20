import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import routes from '../../routes'

import Router from '../../routes'

export default class Root extends Component {
    render() {
        const { store } = this.props
        return (
            <Provider store={store}>
                <Router />
            </Provider>
        )
    }
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}
