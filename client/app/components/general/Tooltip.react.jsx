import _ from 'lodash'
import React, { PropTypes } from 'react'
import classNames from 'classnames'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export const Tooltip = React.createClass({
	getInitialState: function() {
		return {
			showTooltip: false
		}
	},
	toggleTip: function() {
		this.setState({showTooltip: !this.state.showTooltip})
	},
	render: function() {
		return (
			<div className="tooltip" onMouseEnter={this.toggleTip} onMouseLeave={this.toggleTip}>
				{this.props.children}
				<ReactCSSTransitionGroup transitionName="fade" transitionEnterTimeout={200} transitionLeaveTimeout={200}> 
					{this.state.showTooltip ? 
						<div className="tip">{this.props.tooltip}</div>
					: null }
				</ReactCSSTransitionGroup>
			</div>
		)
	}
})