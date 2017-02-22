"use strict"

import _ from 'lodash'
import React from 'react'
import { PropTypes } from 'react'
import { connect } from 'react-redux'
import store from '../../app'
import classNames from 'classnames'

export const Notification = React.createClass({
    componentDidMount: function() {
        this.timeout = setTimeout(() => {
          store.dispatch(invalidateNotification())  
        } , 5000)
    },

    render: function() {
        let notificationClass = classNames('notification', this.props.className)

        return (
            <div className={notificationClass}>
                {this.props.text}
            </div>
        )
    }
})
