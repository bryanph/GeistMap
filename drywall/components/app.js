import React from 'react'
import ReactDom from 'react-dom'
import { Router, Route, Link, IndexRoute, Redirect, browserHistory } from "react-router"

import Forgot, { ForgotSuccess } from './Forgot'
import Reset, { ResetSuccess } from './Reset'
import Login from './Login'
import Signup, { SignupSocial, SignupSuccess, SignupVerificationSuccess } from './Signup'
import EmailConfirmation, { EmailConfirmationSuccess } from './EmailConfirmation'
import { AccountVerification, VerificationResendSuccess } from './Verification'

// TODO: just require foundaiton in some way... - 2016-08-09
const jQuery = require('jquery')
const $ = jQuery
const foundation = require('foundation-sites')

$(document).foundation();
console.log(foundation)

const App = (props) => (
    <div>
        <div className="top-bar">
            <div className="top level row expanded">
                <div className="columns">
                    <a href="https://www.iatistudio.com" className="logo"><img src="" /></a>
                    <div className="title">IATI Studio</div>
                    <div className="release">beta release 1.1</div>
                </div>
            </div>
        </div>
        <div id="content-wrap-public">
            <div className="row">
                <div className="columns small-centered small-12 medium-9 large-5 xlarge-4 xxlarge-3">
                    {props.children}
                </div>
            </div>
        </div>
    </div>
)

// TODO: Take from the main config 2016-05-04
const baseURL = '/auth'

const routes = (
    <Route path={baseURL} component={App}>
        <Route path="login" component={Login}/>
        <Route path="signup" component={Signup}/>
        <Route path="signup/success" component={SignupVerificationSuccess}/>
        <Route path="signup/social" component={EmailConfirmation}/>
        <Route path="signup/social/success" component={EmailConfirmationSuccess}/>
        <Route path="login/forgot" component={Forgot}/>
        <Route path="login/forgot/success" component={ForgotSuccess}/>

        <Route path="login/reset/:email/:token" component={Reset}/>
        <Route path="login/reset/success" component={ResetSuccess}/>

        <Route path="account/verification" component={AccountVerification}/>
        <Route path="account/verification/success" component={VerificationResendSuccess}/>
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
