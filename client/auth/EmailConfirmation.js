

import React from 'react'
import { browserHistory, withRouter, Link } from "react-router-dom"
import fetchJSON from './utils/fetch'

import Social from './Social'
import getHeaders from './headers'

import { RenderErrors, ValidationErrors } from './Error'
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

import createClass from 'create-react-class'

const EmailConfirmation  = createClass({

    handleResponse: function(json, response) {
        if (Object.keys(json.errfor).length) {
            return this.setState({validationErrors: json.errfor})
        }
        if (json.errors.length) {
            return this.setState({errors: json.errors})
        }

        this.props.history.push('/auth/login/forgot/success')
    },

    handleError: function(error) {
        console.error(error);
    },

    getInitialState: function() {
        return {
            errors: [],
            validationErrors: {},
        }
    },

    render: function() {
        const {
            oauthTwitter,
            oauthGitHub,
            oauthFacebook,
            oauthGoogle,
        } = this.props

        const {
            errors,
            validationErrors,
        } = this.state

        return (

            <div className="interact panel with-logo">
                <div className="logo"></div>
                <h3>Email confirmation</h3>
                <p>Enter your email address in the form below to get started</p>
                <EmailConfirmationForm 
                    email={this.props.match.params && this.props.match.params.email || ''}
                    handleError={this.handleError}
                    handleResponse={this.handleResponse}
                />
                { validationErrors ? <ValidationErrors errors={validationErrors} /> : null }
                { errors ? <RenderErrors errors={errors} /> : null }
            </div>

        )
    }
})

export default withRouter(EmailConfirmation)

export const ForgotPassword = (props) => (
    <Link to='/login/forgot'>Forgot your password?</Link>
)

export const EmailConfirmationForm = createClass({

    handleSubmit: function(e) {
        e.preventDefault()

        fetchJSON('/auth/signup/social', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                email: this._email.getValue(),
            })
        })
            .then(this.props.handleResponse)
            .catch(this.props.handleError)
    },

    render: function() {
        return (
            <form id="email_confirmation-form" ref={c => this._form = c}>
                <TextField
                    defaultValue={this.props.email}
                    hintText="email"
                    ref={c => this._email = c}
                    type="email"
                />
                <FlatButton
                    onClick={this.handleSubmit}   
                    label="Confirm your email"
                    primary={true}
                    style={{marginTop: '20px'}}
                />
            </form>

        )
    }
})

export const EmailConfirmationSuccess = (props) => (
    <div>
        <h2>Succesfully registered</h2>
        <Link to="/">Click here to go to the app</Link>
    </div>
)

