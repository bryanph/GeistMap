import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { resetErrorMessage } from '../../reducers'
import { isLoggedIn } from '../../utils/login.js'

import Topbar from "../../components/Topbar";
import PublicTopbar from "../../components/PublicTopbar"

import Dialogs from '../../containers/Dialogs'
import Errors from '../../containers/Errors'

// import getMuiTheme from 'material-ui/styles/getMuiTheme';
import getMuiTheme from '../../containers/App/muitheme.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { HotKeys } from 'react-hotkeys'
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const keyMapping = {
    'explore': 'ctrl+alt+e',
    'addRelation': 'ctrl+alt+r',
    'duplicate': 'ctrl+alt+d',
    'trash': 'ctrl+alt+g',
    'addCollection': 'ctrl+alt+c',
    'focusSearch': 'ctrl+alt+f',

}

import './styles.css'

const App = React.createClass({

    renderError: function() {
        const { errorMessage } = this.props
            
        if (!errorMessage) {
            return null
        }

        return (
            <h1>{errorMessage}</h1>
        )
    },

    render: function() {
        const { isLoggedIn } = this.props
        const { pathname } = this.props.location

        var segment = pathname.split('/')[1] || 'root';

        const key = this.props.routes[2].path

        return (
            <MuiThemeProvider muiTheme={getMuiTheme()} key={key}>
                <HotKeys keyMap={keyMapping} style={{height: '100%'}}>
                    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                        <Dialogs params={this.props.params} location={this.props.location} />
                        <Errors />
                        <Topbar />

                        { this.renderError() }

                        { this.props.children }

                        { /* <ReactCSSTransitionGroup
                            style={{ height: '100%' }}
                            transitionName="fadeLeft"
                            transitionEnterTimeout={500}
                            transitionLeaveTimeout={300}
                        >
                             { React.cloneElement(this.props.children || <div />, { key: pathname }) }
                        </ReactCSSTransitionGroup>
                        */ }

                    </div>
                </HotKeys>
            </MuiThemeProvider>
        )   
    }
})

function mapStateToProps(state, props) {
    return {
        errorMessage: state.errorMessage,
        isLoggedIn: isLoggedIn(),
    }
}

export default connect(mapStateToProps, {
    resetErrorMessage
})(App)

