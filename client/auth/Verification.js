

import React from 'react'
import { withRouter } from "react-router-dom"
import { Link } from "react-router-dom"
import fetchJSON from './utils/fetch'

import Social from './Social'
import getHeaders from './headers'

import { RenderErrors, ValidationErrors } from './Error'
import { ForgotPassword } from './Forgot'

import { InputEmail, ValidateInput } from '../app/components/input'
import { FlatButton } from '../app/components/button'

class AccountVerification extends React.Component {
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

        this.props.history.push({
            pathname: '/auth/account/verification/success',
            search: this.props.location.search
        })
    }

    handleError(error) {
        console.error(error.stack);
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
                <h3>Email confirmation</h3>
                <p>An email has been sent to your email adress, follow the instructions in the mail to complete your sign-up</p>
                <VerificationForm 
                    handleError={this.handleError}
                    handleResponse={this.handleResponse}
                />

            { validationErrors ? <ValidationErrors errors={validationErrors} /> : null }
            { errors ? <RenderErrors errors={errors} /> : null }
        </div>

        )
    }
}

export default withRouter(AccountVerification)

class VerificationForm extends React.Component {
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

        fetchJSON('/auth/account/verification', {
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
            <form id="verification-form" ref={c => this._form = c}>
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
                >Resend email</FlatButton>
            </form>

        )
    }
}

export const VerificationResendSuccess = (props) => (
    <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>Email confirmation</h3>
        <p>Another verification email has been sent to your email address, click on the link in the email to activate your account</p>
    </div>
)
