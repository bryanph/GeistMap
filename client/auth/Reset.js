

import React from 'react'
import fetchJSON from './utils/fetch'
import { withRouter, Link } from "react-router-dom"

import { RenderErrors, ValidationErrors } from './Error'
import getHeaders from './headers'
import { InputPassword, ValidateInput } from '../app/components/input'
import { FlatButton } from '../app/components/button'

class Reset extends React.Component {
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
            pathname: '/auth/login/reset/success',
            search: this.props.location.search
        })
    }

    handleError(error) {
        console.error(error)
    }

    render() {
        const email = this.props.match.params.email
        const token = this.props.match.params.token

        const {
            errors,
            validationErrors,
        } = this.state

        return (
            <div>
                <ResetForm 
                    email={email}
                    token={token}
                    handleError={this.handleError}
                    handleResponse={this.handleResponse}
                />

            { validationErrors ? <ValidationErrors errors={validationErrors} /> : null }
            { errors ? <RenderErrors errors={errors} /> : null }
        </div>

        )
    }
}

export default withRouter(Reset)

class ResetForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            password: '',
            confirm: '',
            errors: {}
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.validate = this.validate.bind(this);
    }

    validate(password, confirm) {
        const errors = {}

        if (!password) {
            errors.password = "Required"
        }

        if (!confirm) {
            errors.confirm = "Required"
        }

        if (password !== confirm) {
            errors._error = "The passwords you entered are not the same"
        }

        return errors
    }

    handleSubmit(e) {
        e.preventDefault()

        const errors = this.validate(this.state.password, this.state.confirm)
        if (Object.keys(errors).length > 0) {
            return this.setState({ errors })
        }

        const { email, token } = this.props

        const path = `/auth/login/reset/${email}/${token}`

        fetchJSON(path, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                password: this.state.password,
                confirm: this.state.confirm,
            })
        })
            .then(this.props.handleResponse)
            .catch(this.props.handleError)
    }

    render() {
        return (
            <div className="interact panel with-logo">
                <div className="logo"></div>
                <h3>Reset your password</h3>
                <p>Enter a new password in the fields below.</p>
                <form className="resetForm">
                    <ValidateInput error={this.state.errors.password}>
                        <InputPassword
                            name="password"
                            placeholder="password"
                            onChange={e => this.setState({ password: e.target.value })}
                            value={this.state.password}
                        />
                    </ValidateInput>
                    <ValidateInput error={this.state.errors.confirm}>
                        <InputPassword
                            name="confirm"
                            placeholder="confirm password"
                            onChange={e => this.setState({ confirm: e.target.value })}
                            value={this.state.confirm}
                        />
                    </ValidateInput>
                    <FlatButton
                        onClick={this.handleSubmit}   
                        style={{marginTop: '10px'}}
                    >Confirm Reset</FlatButton>
                </form>
            </div>
        )
    }
}

export const ResetSuccess = (props) => (
    <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>Your password has succesfully been reset.</h3>
        <Link to='/auth/login'>Back to login</Link>
    </div>
)

