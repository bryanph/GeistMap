
import React, { PropTypes } from 'react'
import fetchJSON from './utils/fetch'
import { withRouter } from "react-router"
import { Link } from 'react-router'

import { RenderErrors, ValidationErrors } from './Error'
import getHeaders from './headers'

const Forgot = React.createClass({

  handleResponse: function(json, response) {
      if (Object.keys(json.errfor).length) {
          return this.setState({validationErrors: json.errfor})
      }
      if (json.errors.length) {
          return this.setState({errors: json.errors})
      }

      this.props.router.push('/auth/login/forgot/success')
  },

  handleError: function(error) {
    console.error(error)
  },

  getInitialState: function() {
      return {
          errors: [],
          validationErrors: {},
      }
  },

  render: function() {
    const {
        errors,
        validationErrors,
    } = this.state
    
    return (
            <div>
              <div className="interact panel with-logo">
                <div className="logo"></div>
                <h3>Reset your password</h3>
                <p>Enter your email address to receive a reset link</p>
                <ForgotForm 
                  handleError={this.handleError}
                  handleResponse={this.handleResponse}
                />
              </div>
              { validationErrors ? <ValidationErrors errors={validationErrors} /> : null }
              { errors ? <RenderErrors errors={errors} /> : null }
            </div>

      
    )
  }
})

export default withRouter(Forgot)

export const ForgotForm = React.createClass({

    propTypes: {
        handleError: PropTypes.func.isRequired,
        handleResponse: PropTypes.func.isRequired
    },

  getInitialState: function() {
    return {
      email: '',
    }
  },

  handleSubmit: function(e) {
      e.preventDefault()

      fetchJSON('/auth/login/forgot', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
              email: this._email.value,
          })
      })
      .then(this.props.handleResponse)
      .catch(this.props.handleError)
  },


  render: function() {
    return (
        <form id="signup-form" ref={c => this._form = c}>
            <input 
                type="email" 
                ref={c => this._email = c}
                placeholder="Your email address"
            />
          <button className="button input-height" onClick={this.handleSubmit}>Confirm reset</button>
        </form>
    )
  }
})

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
