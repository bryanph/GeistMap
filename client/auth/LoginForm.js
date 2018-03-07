import React from 'react'

import { FlatButton } from '../app/components/button'
import { InputEmail, InputPassword, ValidateInput } from '../app/components/input'

import fetchJSON from './utils/fetch'
import getHeaders from './headers'

const styles = {
    container: {
        margin: '1rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    textField: {
        width: '100%',
    },
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            username: '',
            password: '',
            errors: {}
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.validate = this.validate.bind(this);
    }

    validate(username, password) {
        const errors = {}

        if (!username) {
            errors.username = "Required"
        }
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(username)) {
            errors.username = "Invalid email address"
        }

        if (!password) {
            errors.password = "Required"
        }

        return errors
    }

    handleSubmit(e) {
        e.preventDefault()

        const errors = this.validate(this.state.username, this.state.password)
        if (Object.keys(errors).length > 0) {
            return this.setState({ errors })
        }

        fetchJSON('/auth/login', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
            })
        })
            .then(this.props.handleResponse)
            .catch(this.props.handleError)
    }

    render() {
        return (
            <form className="loginForm">
                <ValidateInput error={this.state.errors.username}>
                    <InputEmail
                        name="email"
                        placeholder="email"
                        onChange={e => this.setState({ username: e.target.value })}
                        value={this.state.username}
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
                <FlatButton
                    onClick={this.handleSubmit}   
                    style={{marginTop: '10px'}}
                >Log In</FlatButton>
            </form>
        )
    }
}

export default LoginForm
