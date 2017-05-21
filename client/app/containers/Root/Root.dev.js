
import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'

import Router from '../../routes'

export default class Root extends Component {
    render() {
        const { store } = this.props

        return (
            <Provider store={store}>
                <div style={{height: '100%'}}>
                    <Router />
                </div>
            </Provider>
        )
    }
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}
