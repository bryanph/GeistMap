
import React from 'react'
import { Link } from "react-router-dom"
import fetchJSON from './utils/fetch'

import Social from './Social'
import getHeaders from './headers'

import { RenderErrors, ValidationErrors } from './Error'
import { ForgotPassword } from './Forgot'

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import createClass from 'create-react-class'
import Divider from './Divider'

const Signup = createClass({

    handleResponse: function(json, response) {
            if (Object.keys(json.errfor).length) {
                return this.setState({validationErrors: json.errfor})
            }
            if (json.errors.length) {
                return this.setState({errors: json.errors})
            }

            window.location = '/app'
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
                withBackButton,
            } = this.props

            const {
                errors,
                validationErrors,
            } = this.state

            return (
                <div>
                    <div className="panel">
                        <h2>Sign up</h2>
                        <span className="panel-authText">With</span>
                        <Social {...this.props} />
                        <Divider />
                        <SignupForm
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
})

export default Signup


const styles = {
    container: {
        margin: '1rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    textField: {
        width: '100%',
    }
}

export const SignupForm = createClass({

    getInitialState: function() {
            return {
                email: '',
                username: '',
                password: '',
            }
        },

        handleSubmit: function(e) {
            e.preventDefault()

            fetchJSON('/auth/signup', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    email: this._email.input.value,
                    username: this._email.input.value,
                    password: this._password.input.value,
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
                        ref={c => this._email = c}
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
                        label="Sign up"
                        primary={true}
                        style={{marginTop: '20px'}}
                    />
            </form>

            )
        }
})

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
