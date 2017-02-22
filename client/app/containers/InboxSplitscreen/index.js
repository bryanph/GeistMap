/*
 *
 * Inbox
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import styles from './styles.css';

import { withRouter } from 'react-router'
import { loadInboxNodes, removeNode } from '../../actions/async'
import moment from 'moment'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Delete from 'material-ui/svg-icons/action/delete';
import Divider from 'material-ui/Divider';
const iconButtonElement = (
    <IconButton
        touch={true}
        tooltip="options"
        tooltipPosition="bottom-left"
        style={{ width:72, height:72, padding:0 }}
        iconStyle={{ width: 36, height:36 }}
    >
        <MoreVertIcon color={grey400} />
    </IconButton>
);
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
const rightIconMenu = ({ onRemove }) => { 

    return (
        <IconMenu 
            iconButtonElement={iconButtonElement}
            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
        >
            <MenuItem 
                primaryText="Remove" 
                leftIcon={<Delete />} 
                onTouchTap={onRemove}
            />
        </IconMenu>
    )
};

export const NodeListItem = ({ name, editorState, content, modifiedDate, ...props }) => (
    <ListItem
        primaryText={name}
        secondaryText= {
            <p className={'nodeListItem-secondaryText'}>
                <span className={'nodeListItem-date'} style={{color: "black", "padding-top": "2px", display: 'block'}}>{ moment.unix(modifiedDate / 1000).fromNow() } <br/></span>
                { content }
            </p>
        }
        secondaryTextLines={2}
        rightIconButton={rightIconMenu({ onRemove: () => props.onRemoveNode(props.id) })}
        { ...props }
    />
)
NodeListItem.propTypes = {
    name: PropTypes.string.isRequired,
}

const NodeTable = withRouter(class extends React.Component {

    constructor(props) {
        super(props)

        this.nodeDetailRoute = this.nodeDetailRoute.bind(this)
    }

    nodeDetailRoute(nodeId) {
        console.log(nodeId);
        this.props.router.push(`/app/nodes/${nodeId}`)
    }

    render() {

        // TODO: pass abbreviated content... - 2016-07-19
        const listItems = this.props.nodes.map(node => (
            <NodeListItem
                key={node.id}
                id={node.id}
                name={node.properties.name}
                content={node.properties.editorPlainText}
                modifiedDate={node.properties.modified}
                onTouchTap={this.nodeDetailRoute.bind(this, node.id)}
                onRemoveNode={this.props.onRemoveNode}
            />
        ))
        return (
            <div className={ styles.nodeTable }>
                <List>
                    <Subheader>Inbox</Subheader>
                    { listItems }
                </List>
            </div>
        );
    }
})


export class Inbox extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props)

        this.removeNode = this.removeNode.bind(this)
    }

    componentDidMount() {
        this.props.loadInboxNodes()
    }

    removeNode(nodeId) {
        const result = window.confirm("Are you sure you want to delete this node, including all of its links?")
        if (result) {
            this.props.removeNode(nodeId)
                .then(() => this.props.router.push(`/app/nodes`))
        }
    }

    render() {
        return (
            <div className={ styles.inbox }>
                <div style={{ border: 'solid 1px #d9d9d9' }}>
                <NodeTable 
                    nodes={this.props.nodes} 
                    onRemoveNode={this.removeNode}
                />
                </div>
            </div>
        );
    }
}

import { getInboxNodes } from '../../reducers'

function mapStateToProps(state) {
    return {
        nodes: getInboxNodes(state),
    }
}

export default connect(mapStateToProps, { loadInboxNodes, removeNode })(withRouter(Inbox));
