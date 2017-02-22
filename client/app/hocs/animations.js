
import React, { PropTypes } from 'react'
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

import './styles.css'

export const FadeLeft = (Component, enterTimeout=5000, leaveTimeout=3000) => {
    return (props) => (
        <ReactCSSTransitionGroup
            style={{ height: '100%', color: 'blue' }}
            transitionName="fadeLeft"
            transitionEnterTimeout={enterTimeout}
            transitionLeaveTimeout={leaveTimeout}
        >
            <Component {...props} key={props.location.pathname} />
        </ReactCSSTransitionGroup>
    )
}
