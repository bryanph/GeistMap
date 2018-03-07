

import React from 'react'
import { browserHistory, withRouter, Link } from "react-router-dom"
import fetchJSON from './utils/fetch'

import Social from './Social'
import getHeaders from './headers'

import { RenderErrors, ValidationErrors } from './Error'
import { InputEmail, ValidateInput } from '../app/components/input'
import { FlatButton } from '../app/components/button'

class EmailConfirmation extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            errors: [],
            validationErrors: {},
        }

        this.handleResponse = this.handleResponse.bind(this)
        this.handleError = this.handleError.bind(this)
    }

    handleResponse(json, response) {
        if (Object.keys(json.errfor).length) {
            return this.setState({validationErrors: json.errfor})
        }
        if (json.errors.length) {
            return this.setState({errors: json.errors})
        }

        this.props.history.push('/auth/login/forgot/success')
    }

    handleError(error) {
        console.error(error);
    }

    render() {
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
}

export default withRouter(EmailConfirmation)

export const ForgotPassword = (props) => (
    <Link to='/login/forgot'>Forgot your password?</Link>
)

class EmailConfirmationForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            email: '',
            errors: {},
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.validate = this.validate.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault()

        const errors = this.validate(this.state.email)
        if (Object.keys(errors).length > 0) {
            return this.setState({ errors })
        }

        fetchJSON('/auth/signup/social', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                email: this.state.email,
            })
        })
            .then(this.props.handleResponse)
            .catch(this.props.handleError)
    }

    validate(email) {
        const errors = {}

        if (!email) {
            errors.email = "Required"
        }
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
            errors.email = "Invalid email address"
        }

        return errors
    }

    render() {
        return (
            <form className="emailConfirmationForm">
                <ValidateInput error={this.state.errors.email}>
                    <InputEmail
                        name="email"
                        placeholder="email"
                        onChange={e => this.setState({ email: e.target.value })}
                        value={this.state.email}
                    />
                </ValidateInput>
                <FlatButton
                    onClick={this.handleSubmit}   
                    style={{marginTop: '10px'}}
                >Confirm your email</FlatButton>
            </form>

        )
    }
}

export const EmailConfirmationSuccess = (props) => (
    <div>
        <h2>Succesfully registered</h2>
        <Link to="/">Click here to go to the app</Link>
    </div>
)

