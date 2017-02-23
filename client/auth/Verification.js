

import React, { PropTypes } from 'react'
import { withRouter } from "react-router"
import { Link } from "react-router"
import fetchJSON from './utils/fetch'

import Social from './Social'
import getHeaders from './headers'

import { RenderErrors, ValidationErrors } from './Error'
import { ForgotPassword } from './Forgot'

import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

const AccountVerification  = React.createClass({

  propTypes: {
      oauthMessage: PropTypes.string,
      oauthTwitter: PropTypes.bool.isRequired,
      oauthGitHub: PropTypes.bool.isRequired,
      oauthFacebook: PropTypes.bool.isRequired,
      oauthGoogle: PropTypes.bool.isRequired,
      oauthTumblr: PropTypes.bool.isRequired,
  },

  handleResponse: function(json, response) {
      if (Object.keys(json.errfor).length) {
          return this.setState({validationErrors: json.errfor})
      }
      if (json.errors.length) {
          return this.setState({errors: json.errors})
      }

      // console.log('called...');
      // // TODO: account verification - 2016-05-10
      // window.location = '/'

      console.log("pushing...");
      console.log(this.props);
      this.props.router.push('/auth/account/verification/success')

      // this.props.router.push('/auth/login/forgot/success')
      // this.props.router.push('/auth/login/forgot/success')
  },

  handleError: function(error) {
      console.error(error.stack);
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
      oauthTumblr,
    } = this.props

    const {
        errors,
        validationErrors,
    } = this.state

    return (

    <div className="interact panel with-logo">
        <h3>Email confirmation</h3>
        <p>An email has been sent to your email adress, follow the instructions in the mail to complete your sign-up</p>
        <VerificationForm 
          handleError={this.handleError}
          handleResponse={this.handleResponse}
        />

        { validationErrors ? <ValidationErrors errors={validationErrors} /> : null }
        { errors ? <RenderErrors errors={errors} /> : null }
      </div>

    )
  }
})

export default withRouter(AccountVerification)

export const VerificationForm = React.createClass({

  propTypes: {
        handleError: PropTypes.func.isRequired,
        handleResponse: PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {
      email: '',
    }
  },

  handleSubmit: function(e) {
      e.preventDefault()

      fetchJSON('/auth/account/verification', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
              email: this._email.getValue(),
          })
      })
      .then(this.props.handleResponse)
      .catch(this.props.handleError)
  },

  render: function() {
    
    return (
        <form id="verification-form" ref={c => this._form = c}>
            <TextField
                hintText="email"
                ref={c => this._email = c}
                type="email"
            />
          <FlatButton
            onClick={this.handleSubmit}   
            label="Resend email"
            primary={true}
            style={{marginTop: '20px'}}
          />
        </form>

    )
  }
})

export const VerificationResendSuccess = (props) => (
      <div className="interact panel with-logo">
        <div className="logo"></div>
        <h3>Email confirmation</h3>
        <p>Another verification email has been sent to your email address, click on the link in the email to activate your account</p>
      </div>
)
