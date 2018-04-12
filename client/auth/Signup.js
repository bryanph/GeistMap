
import React from 'react'
import { Link } from "react-router-dom"
import fetchJSON from './utils/fetch'

import Social from './Social'
import getHeaders from './headers'

import { RenderErrors, ValidationErrors } from './Error'
import { ForgotPassword } from './Forgot'

import { InputEmail, InputPassword, ValidateInput } from '../app/components/input'
import { FlatButton } from '../app/components/button'

import Divider from './Divider'

class Signup extends React.Component {
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

        window.location = '/app'
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
            withBackButton,
        } = this.props

        const {
            errors,
            validationErrors,
        } = this.state

        return (
            <div>
                <div className="panel">
                    <span className="panel-title">Sign up</span>
                    <span className="panel-authText">With</span>
                    <Social {...this.props} />
                    <Divider />
                    <SignupForm
                        { ...this.props }
                        handleError={this.handleError}
                        handleResponse={this.handleResponse}
                    />
                </div>
                {
                    withBackButton ?
                        <div className="panel">
                            <Link to='/auth/login'>Back to login</Link>
                        </div>
                        : null
                }
                { validationErrors ? <ValidationErrors errors={this.state.validationErrors} /> : null }
                { errors ? <RenderErrors errors={this.state.errors} /> : null }
            </div>
        )
    }

}

export default Signup

class SignupForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            email: '',
            username: '',
            password: '',
            errors: {}
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.validate = this.validate.bind(this);
    }

    validate(email, password) {
        const errors = {}

        if (!email) {
            errors.email = "Required"
        }
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
            errors.email = "Invalid email address"
        }

        if (!password) {
            errors.password = "Required"
        }

        return errors
    }

    handleSubmit(e) {
        e.preventDefault()

        const errors = this.validate(this.state.email, this.state.password)
        if (Object.keys(errors).length > 0) {
            return this.setState({ errors })
        }

        fetchJSON('/auth/signup', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                email: this.state.email,
                username: this.state.email,
                password: this.state.password,
            })
        })
            .then(this.props.handleResponse)
            .catch(this.props.handleError)
    }

    render() {
        return (
            <form className="signupForm">
                <ValidateInput error={this.state.errors.email}>
                    <InputEmail
                        name="email"
                        placeholder="email"
                        onChange={e => this.setState({ email: e.target.value })}
                        value={this.state.email}
                    />
                </ValidateInput>
                <ValidateInput error={this.state.errors.password}>
                    <InputPassword
                        name="password"
                        placeholder="password"
                        onChange={e => this.setState({ password: e.target.value })}
                        value={this.state.password}
                    />
                </ValidateInput>
                <span className="signupForm-tos">By signing up you agree with the <a target="_blank" href={ this.props.termsOfServiceUrl }>terms of service</a> and the <a target="_blank" href={ this.props.privacyPolicyUrl }>privacy policy</a></span>
                <FlatButton
                    onClick={this.handleSubmit}   
                    style={{marginTop: '10px'}}
                >SIGN UP</FlatButton>
            </form>

        )
    }
}

export const SignupVerificationSuccess = (props) => (
    <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>A verification email has been sent to your email address, click on the link in the email to activate your account</h3>
    </div>
)

export const SignupSuccess = (props) => (
    <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>Sign up success!</h3>
        <p>Succesfully signed up, <Link to='/auth/login'>log in here</Link></p>
    </div>
)

export const SignupError = (props) => (

    <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>Error</h3>
        <p>Something went wrong, please try again.</p>
        <Link to='/auth/login'>Back to login</Link>
    </div>

)
