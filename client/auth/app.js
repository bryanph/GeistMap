import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Route, Link, Redirect, Switch } from "react-router-dom"
import withProps from 'recompose/withProps'

import Forgot, { ForgotSuccess } from './Forgot'
import Reset, { ResetSuccess } from './Reset'
import Login from './Login'
import Signup, { SignupSocial, SignupSuccess, SignupVerificationSuccess } from './Signup'
import EmailConfirmation, { EmailConfirmationSuccess } from './EmailConfirmation'
import AccountVerification, { VerificationResendSuccess } from './Verification'

import "../scss/landing.scss"

// TODO: get config in context somehow - 2016-08-11

import getMuiTheme from '../app/containers/App/muitheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const App = (props) => (
    <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div className="row stretch">
            <div className="main-container stretch columns small-centered small-12 medium-9 large-5 xlarge-4 xxlarge-3">
                <Router {...props} />
            </div>
        </div>
    </MuiThemeProvider>
)

// TODO: Take from the main config 2016-05-04
// const baseURL = '/auth'

const Router = (props) => {
    const withInitialState = withProps(props)
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/auth/login" component={withInitialState(Login)}/>
                <Route exact path="/auth/signup" component={withInitialState(Signup)}/>
                <Route exact path="/auth/signup/success" component={withInitialState(SignupVerificationSuccess)}/>
                <Route exact path="/auth/signup/social" component={withInitialState(EmailConfirmation)}/>
                <Route exact path="/auth/signup/social/:email" component={withInitialState(EmailConfirmation)}/>
                <Route exact path="/auth/signup/social/success" component={withInitialState(EmailConfirmationSuccess)}/>
                <Route exact path="/auth/login/forgot" component={withInitialState(Forgot)}/>
                <Route exact path="/auth/login/forgot/success" component={withInitialState(ForgotSuccess)}/>

                <Route exact path="/auth/login/reset/:email/:token" component={withInitialState(Reset)}/>
                <Route exact path="/auth/login/reset/success" component={withInitialState(ResetSuccess)}/>

                <Route exact path="/auth/account/verification" component={withInitialState(AccountVerification)}/>
                <Route exact path="/auth/account/verification/success" component={withInitialState(VerificationResendSuccess)}/>
                <Route path="*" component={withInitialState(Login)}/>
            </Switch>
        </BrowserRouter>
    )
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(
        <App {...(window.INITIAL_STATE || {})}/>,
        document.getElementById('root')
    );
});
