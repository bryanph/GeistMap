
import React, { PropTypes } from 'react'
import { browserHistory } from "react-router"
import { Link } from "react-router"

import Social from './Social'

import { RenderErrors, ValidationErrors } from './Error'
import { ForgotPassword } from './Forgot'

import Divider from './Divider'
import LoginForm from './LoginForm'

export const Login = React.createClass({

    propTypes: {
        oauthMessage: PropTypes.string,
        oauthTwitter: PropTypes.bool.isRequired,
        oauthGitHub: PropTypes.bool.isRequired,
        oauthFacebook: PropTypes.bool.isRequired,
        oauthGoogle: PropTypes.bool.isRequired,
        oauthTumblr: PropTypes.bool.isRequired,
    },

    getInitialState: function() {
            return {
                errors: [],
                validationErrors: {},
            }
        },

        handleResponse: function(json, response) {
            if (Object.keys(json.errfor).length) {
                return this.setState({validationErrors: json.errfor})
            }
            if (json.errors.length) {
                return this.setState({errors: json.errors})
            }

            window.location = '/auth/login'
        },

        handleError: function(error) {
            throw error
        },

        render: function() {
            const {
                oauthTwitter,
                oauthGitHub,
                oauthFacebook,
                oauthGoogle,
                oauthTumblr,
            } = this.props


            console.log(this.props);

            const {
                errors,
                validationErrors,
            } = this.state

            return (
                <div>
                    <div className="panel">
                        <h2>Log in</h2>
                        <span className="panel-authText">With</span>
                        <Social {...this.props} />
                        <Divider />
                        <LoginForm
                            handleError={this.handleError}
                            handleResponse={this.handleResponse}
                        />
                        <ForgotPassword />
                    </div>

                    <div className="panel bottom-panel">
                        Not a member yet? <Link to='/auth/signup'>Sign up!</Link>
                    </div>
                    { validationErrors ? <ValidationErrors errors={this.state.validationErrors} /> : null }
                    { errors ? <RenderErrors errors={this.state.errors} /> : null }
                </div>
            )
        }
})

export default Login

export const LoginValidationError = (props) => {
    let errors = props.formatErrors

    return (
        <div>
            <h2>The following fields are required: {errors.keys().join(',')}</h2>
        </div>
    )
}

export const LoginError = (props) => {

    let errors = props.errors.map(error => (
        <li>{error}</li>
    ))

    return (
        <ul>
            {errors}
        </ul>
    )
}
