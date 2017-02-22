/*
 *
 * RemoveNodeButton
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import DeleteButton from '../../components/DeleteButton'

export class RemoveNodeButton extends React.Component { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props)
        this.removeNode = this.removeNode.bind(this)
    }

    removeNode() {
        const result = window.confirm("Are you sure you want to delete this node, including all of its links?")
        if (result) {
            this.props.removeNode(this.props.id)
                .then(() => this.props.router.push(`/app/nodes`))
        }
    }

    render() {
        <DeleteButton
            onClick={this.removeNode}
        />
    }
}
RemoveNodeButton.PropTypes = {
    id: PropTypes.string.isRequired,
}

import { withRouter } from 'react-router'
import { removeNode } from '../../actions/async'

export default connect(null, { removeNode })(withRouter(RemoveNodeButton));
