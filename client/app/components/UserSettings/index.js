"use strict"

import _ from 'lodash'
import React from 'react'
import { PropTypes } from 'react'
import { connect } from 'react-redux'
import store from '../../app'
import classNames from 'classnames'
import { toggleMainMenu } from '../../actions/sync'

const UserSettings = React.createClass({
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
                        <h2 className="page-title">Edit your IATI Studio settings</h2>
                    </div>
        		</div>
        	</div>
        )
    }
})

function mapStateToProps(state, props) {

    const { navState } = state

    return {
        navState: navState
    }
}

export default connect(mapStateToProps)(UserSettings)
