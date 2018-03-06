import React from 'react'

import { FlatButton } from '../app/components/button'
import TextField from 'material-ui/TextField';

import fetchJSON from './utils/fetch'
import getHeaders from './headers'
import createClass from 'create-react-class'

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

export const LoginForm = createClass({

    getInitialState: function() {
        return {
            username: '',
            password: '',
        }
    },

    handleSubmit: function(e) {
        e.preventDefault()

        fetchJSON('/auth/login', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                username: this._username.getValue(),
                password: this._password.getValue(),
            })
        })
            .then(this.props.handleResponse)
            .catch(this.props.handleError)
    },

    render: function() {
        return (
            <form id="signup-form" ref={c => this._form = c} style={styles.container}>
                <TextField
                    hintText="email"
                    ref={c => this._username = c}
                    style={styles.textField}

                />
                <TextField
                    hintText="password"
                    ref={c => this._password = c}
                    style={styles.textField}
                    type="password"
                />
                <FlatButton
                    onClick={this.handleSubmit}   
                    style={{marginTop: '10px'}}
                >Log In</FlatButton>
            </form>
        )
    }
})

export default LoginForm
