/*
 *
 * NodeCollectionListContainer
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import NodeCollectionList from '../../components/NodeCollectionList'

export class NodeCollectionListContainer extends React.Component { // eslint-disable-line react/prefer-stateless-function
    render() {
        return (
            <NodeCollectionList 
                addNodeToCollection={this.props.addNodeToCollection}
                removeNodeFromCollection={this.props.removeNodeFromCollection}
                createCollection={this.props.createCollection}
                node={this.props.node}
                collections={this.props.collections}
                outsideClickIgnoreClass="nodeCollectionList"
            />
        );
    }
}

import { getCollectionsByNodeId } from '../../reducers'
import { addNodeToCollection, removeNodeFromCollection, createCollection } from '../../actions/async'

function mapStateToProps(state, props) {

    return {
        collections: getCollectionsByNodeId(state, props.id),
            ...props,
    }
}

export default connect(mapStateToProps, { 
    addNodeToCollection, 
    removeNodeFromCollection, 
    createCollection,
})(NodeCollectionListContainer);
