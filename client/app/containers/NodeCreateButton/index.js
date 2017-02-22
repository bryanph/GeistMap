/*
 *
 * NodeCreateButton
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { withRouter } from 'react-router'
import AddButton from '../../components/AddButton'

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';

const defaultNode = {
    name: 'Untitled',
    content: '',
}

            // <AddButton onClick={this.createNode} {...this.props} />
export class NodeCreateButton extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props)

        this.createNode = this.createNode.bind(this)
        this.createCollection = this.createCollection.bind(this)
    }

    createNode() {
        return this.props.createBatchNode(defaultNode)
            .then(action => action.response.result)
            .then(id => this.props.router.push(`/app/inbox/${id}`))
    }

    createCollection() {
        return this.props.showCreateCollectionWindow(defaultNode)
    }

    render() {
        return (
            <IconMenu
                iconButtonElement={<IconButton style={{height: '100%'}}><AddButton mini={true} /></IconButton>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                {...this.props}
            >
                {/* style 100% height nescessary for vertical centering in topbar.. */}
                <MenuItem primaryText="Node" onClick={this.createNode}/>
                <MenuItem primaryText="Collection" onClick={this.createCollection} />
            </IconMenu>
        );
    }
}

import { createNode, createBatchNode } from '../../actions/async'
import { showCreateCollectionWindow } from '../../actions/ui'

export default connect(null, { createNode, createBatchNode, showCreateCollectionWindow })(withRouter(NodeCreateButton));
