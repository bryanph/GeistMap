

import React from 'react'
import fetchJSON from './utils/fetch'
import { withRouter, Link } from "react-router-dom"

import { RenderErrors, ValidationErrors } from './Error'
import getHeaders from './headers'

const Reset = React.createClass({

  handleResponse: function(json, response) {
      if (Object.keys(json.errfor).length) {
          return this.setState({validationErrors: json.errfor})
      }
      if (json.errors.length) {
          return this.setState({errors: json.errors})
      }

      this.props.history.push('/auth/login/reset/success')
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
        params: {
            email,
            token,
        }
    } = this.props


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
})

export default withRouter(Reset)

export const ResetForm = React.createClass({

  handleSubmit: function(e) {
      e.preventDefault()

      const { email, token } = this.props

      const path = `/auth/login/reset/${email}/${token}`

      fetchJSON(path, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
              password: this._password.value,
              confirm: this._confirm.value,
          })
      })
      .then(this.props.handleResponse)
      .catch(this.props.handleError)
  },


  render: function() {
    return (
      <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>Reset your password</h3>
        <p>Enter a new password in the fields below.</p>
        <form id="signup-form" ref={c => this._form = c}>
            <input 
                type="password" 
                ref={c => this._password = c}
                placeholder="Password"
            />
            <input 
                type="password" 
                ref={c => this._confirm = c}
                placeholder="Confirm password"
            />
          <button className="button input-height" onClick={this.handleSubmit}>Confirm Reset</button>
        </form>
      </div>
    )
  }
})

export const ResetSuccess = (props) => (
  <div>
    <h2>Your password has succesfully been reset.</h2>
    <Link to='/auth/login'>Back to login</Link>
  </div>
)
