import React from 'react'
import ReactDom from 'react-dom'
import { Router, Route, Link, IndexRoute, Redirect, browserHistory } from "react-router"

import Forgot, { ForgotSuccess } from './Forgot'
import Reset, { ResetSuccess } from './Reset'
import Login from './Login'
import Signup, { SignupSocial, SignupSuccess, SignupVerificationSuccess } from './Signup'
import EmailConfirmation, { EmailConfirmationSuccess } from './EmailConfirmation'
import AccountVerification, { VerificationResendSuccess } from './Verification'

// TODO: just require foundaiton in some way... - 2016-08-09
// const jQuery = require('jquery')
// const $ = jQuery
// const foundation = require('foundation-sites')

// $(document).foundation();
// console.log(foundation)
import "../scss/landing.scss"

// TODO: get config in context somehow - 2016-08-11

import getMuiTheme from '../app/containers/App/muitheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const App = (props) => (
    <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div className="row stretch">
            <div className="main-container stretch columns small-centered small-12 medium-9 large-5 xlarge-4 xxlarge-3">
                {props.children}
            </div>
        </div>
    </MuiThemeProvider>
)

// TODO: Take from the main config 2016-05-04
const baseURL = '/auth'

const routes = (
    <Route path={baseURL} component={App}>
        <Route path="login" component={Login}/>
        <Route path="signup" component={Signup}/>
        <Route path="signup/success" component={SignupVerificationSuccess}/>
        <Route path="signup/social" component={EmailConfirmation}/>
        <Route path="signup/social/:email" component={EmailConfirmation}/>
        <Route path="signup/social/success" component={EmailConfirmationSuccess}/>
        <Route path="login/forgot" component={Forgot}/>
        <Route path="login/forgot/success" component={ForgotSuccess}/>

        <Route path="login/reset/:email/:token" component={Reset}/>
        <Route path="login/reset/success" component={ResetSuccess}/>

        <Route path="account/verification" component={AccountVerification}/>
        <Route path="account/verification/success" component={VerificationResendSuccess}/>
        <Route path="*" component={Login}/>
    </Route>
)

function createElement(Component, props) {
    /*
     * Pass server rendered data as props to all components
    */

    let initialState = window.INITIAL_STATE || {}

    return <Component {...props} {...initialState} />
}

document.addEventListener('DOMContentLoaded', function () {
     ReactDom.render(
         <Router 
             history={browserHistory} 
             createElement={createElement}
             routes={routes} 
         />,
          document.getElementById('app')
     );
});
