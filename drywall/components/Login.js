
import React, { PropTypes } from 'react'
import { browserHistory } from "react-router"
import { Link } from "react-router"
import fetchJSON from './utils/fetch'

import Social from './Social'
import getHeaders from './headers'

import { RenderErrors, ValidationErrors } from './Error'
import { ForgotPassword } from './Forgot'

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

      const {
        errors,
        validationErrors,
      } = this.state

    return (

        <div>
          <div className="interact panel with-logo">
            <div className="logo"></div>
            <h3>Log in</h3>
            <p className=""><strong>To IATI Studio</strong></p>
            <Social {...this.props} />
            <div className="divider"><span>Or</span></div>
            <LoginForm
              handleError={this.handleError}
              handleResponse={this.handleResponse}
            />
            <ForgotPassword />

          </div>
          <div className="panel">
            Not a member yet? <Link to='/auth/signup'>Sign up!</Link>
          </div>
          { validationErrors ? <ValidationErrors errors={this.state.validationErrors} /> : null }
          { errors ? <RenderErrors errors={this.state.errors} /> : null }
        </div>

    )
  }
})

export default Login

export const LoginForm = React.createClass({

  propTypes: {
      handleError: PropTypes.func.isRequired,
      handleResponse: PropTypes.func.isRequired,
  },

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
            username: this._username.value,
            password: this._password.value,
          })
      })
      .then(this.props.handleResponse)
      .catch(this.props.handleError)
  },

  render: function() {
    return (
        <form id="signup-form" ref={c => this._form = c}>
            <input 
                type="text" 
                name="username"
                ref={c => this._username = c}
                placeholder="Username or e-mail address"
            />
            <input 
                type="password" 
                name="password"
                ref={c => this._password = c}
                placeholder="Password"
            />

          <button className="button input-height" onClick={this.handleSubmit}>Log In</button>
        </form>
    )
  }
})

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
