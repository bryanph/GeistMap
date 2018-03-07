
import React from 'react'
import fetchJSON from './utils/fetch'
import { withRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { RenderErrors, ValidationErrors } from './Error'
import getHeaders from './headers'

import { FlatButton } from '../app/components/button'
import { InputEmail, ValidateInput } from '../app/components/input'

class Forgot extends React.Component {
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
            pathname: '/auth/login/forgot/success',
            search: this.props.location.search
        })
    }

    handleError(error) {
        console.error(error)
    }

    render() {
        const {
            errors,
            validationErrors,
        } = this.state

        return (
            <div>
                <div className="panel">
                    <span className="panel-title">Reset your password</span>
                    <span className="panel-authText">Enter your email address to receive a reset link</span>
                    <ForgotForm
                        handleError={this.handleError}
                        handleResponse={this.handleResponse}
                    />
                </div>
                <div className="panel bottom-panel">
                    <Link to='/auth/login'>Back to login</Link>
                </div>
                { validationErrors ? <ValidationErrors errors={this.state.validationErrors} /> : null }
                { errors ? <RenderErrors errors={this.state.errors} /> : null }
            </div>


        )
    }
}

export default withRouter(Forgot)

class ForgotForm extends React.Component {
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

        fetchJSON('/auth/login/forgot', {
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
            <form className="forgotForm">
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
                >Reset password</FlatButton>
            </form>
        )
    }
}

export const ForgotPassword = (props) => (
    <Link to='/auth/login/forgot'>Forgot your password?</Link>
)

export const ForgotSuccess = (props) => (

    <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>Reset your password</h3>
        <p>An email has been sent to your email address with instructions to reset your account</p>
        <Link to='/auth/login'>Back to login</Link>
    </div>

)

export const ForgotError = (props) => (

    <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>Error</h3>
        <p>Something went wrong, please try again.</p>
        <Link to='/auth/login'>Back to login</Link>
    </div>

)
