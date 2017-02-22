"use strict"

import _ from 'lodash'
import React from 'react'
import { PropTypes } from 'react'
import { connect } from 'react-redux'
import store from '../../app'
import classNames from 'classnames'
import { toggleMainMenu } from '../../actions/sync'
import { InputText, InputTextArea } from '../general/Input.react.jsx'

const UserProfile = React.createClass({
	componentDidMount: function() {
        store.dispatch(toggleMainMenu(true))
    },
	render: function() {
		const {
            navState,
        } = this.props
		let wrapClass = classNames('pusher',{
            'pushed' : navState.menuState
        })
        return (
        	<div className={wrapClass}>
	        	<div className="row">
        			<div className="columns small-centered small-12 large-10 xlarge-8 user">
        				<h2 className="page-title">Edit your Profile</h2>
                        <div className="row">
                            <div className="columns medium-4">
                                <Avatar />
                            </div>
                            <div className="columns medium-8">
                                <ContactDetails />
                                {/*<ChangePassword />*/}
                            </div>
                        </div>
                        <p><a className="button">Save profile</a></p>
        			</div>
        		</div>
        	</div>
        )
    }
})

const Avatar = props => {
    return (
        <div className="avatar">
            <img src="img/avatar.png" />
            <p>Dirk Diggler</p>
            <a className="button flat">Change avatar</a>
        </div>
    )
}

const ContactDetails = props => {
    return (
        <div className="contact-details">
            <label><span className="label">First name</span>
                <InputText
                    placeholder="First name" 
                />
                <span className="fake-line"></span>
            </label>
            <label><span className="label">Last name</span>
                <InputText
                    placeholder="Last name" 
                />
                <span className="fake-line"></span>
            </label>
            <label><span className="label">Email address</span>
                <InputText
                    placeholder="Email address" 
                />
                <span className="fake-line"></span>
            </label>
        </div>
    )
}

const ChangePassword = props => {
    return (
        <div className="change-password">
            <h6>Change password</h6>
            <label><span className="label">New password</span>
                <InputText
                    type="password"
                    placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;" 
                />
                <span className="fake-line"></span>
            </label>
            <label><span className="label">Repeat password</span>
                <InputText
                    type="password"
                    placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;" 
                />
                <span className="fake-line"></span>
            </label>
        </div>
    )
}

function mapStateToProps(state, props) {

    const { navState } = state

    return {
        navState: navState
    }
}

export default connect(mapStateToProps)(UserProfile)
