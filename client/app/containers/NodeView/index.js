import React from 'react';
import { connect } from 'react-redux';

import {
    loadNode,
    loadCollection,
    loadNodeL1,
    connectNodes,
    updateNode
} from '../../actions/async'

import {
    addNode,
    setActiveNode,
    toggleCollapse,
} from '../../actions/ui'

import NodeView from '../../components/NodeView'

function loadData(props) {
    if (props.collectionId) {
        return props.loadCollection(props.collectionId)
            .then((action) => {
                if (props.nodeId) {
                    props.loadNode(props.nodeId)
                    return action
                }
                return action
            })
    }
    else {
        return props.loadNodeL1(props.nodeId)
    }
}


export class NodeViewContainer extends React.Component {
    componentWillMount() {
        loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.collectionId !== this.props.collectionId || nextProps.nodeId !== this.props.nodeId) {
            loadData(nextProps)
        }
    }

    render() {
        const {
            collection,
            nodes,
            edges,
            focus,
            mode,
        } = this.props

        return (
            <NodeView 
                graphType={ this.props.graphType }
                isLoading={ this.props.isLoading }
                nodes={nodes}
                collections={this.props.collections}
                links={edges}
                mode={mode}
                focus={focus}
                activeNode={this.props.activeNode}
                activeCollection={this.props.activeCollection}

                addNode={this.props.addNode}
                connectNodes={this.props.connectNodes}
                updateNode={this.props.updateNode}
                setActiveNode={this.props.setActiveNode}
                toggleCollapse={this.props.toggleCollapse}
            />
        );
    }
}


import {
    getL1Nodes,
    getL1Edges,
    getCollection,
    getNode,
    getNodesAndEdgesByCollectionId,
    getNodesByCollectionId,
    getEdgesByCollectionId,
} from '../../reducers'

function mapStateToProps(state, props) {
    const collectionId = props.match.params && props.match.params.collectionId
    const nodeId = props.match.params && props.match.params.nodeId

    let nodes, edges, collections, isLoading, graphType;

    if (collectionId) {
        // loading a collection id
        // nodes = getNodesAndEdgesByCollectionId(state, collectionId);
        // edges = getEdgesByCollectionId(state, collectionId);
        ({ nodes, collections, edges } = getNodesAndEdgesByCollectionId(state, collectionId))

        isLoading = state.loadingStates.GET_COLLECTION || state.loadingStates.GET_NODE
        graphType = "collection"
    } else {
        nodes = getL1Nodes(state, nodeId);
        collections = []
        edges = getL1Edges(state, nodeId);
        isLoading = state.loadingStates.GET_NODE_L1
        graphType = "node"
    }

    return {
        collectionId,
        nodeId,
        activeNode: getNode(state, nodeId),
        activeCollection: getCollection(state, collectionId),
        mode: state.graphUiState.mode,
        focus: state.graphUiState.focus,
        nodes,
        edges,
        collections,
        isLoading,
        graphType,
    };
}

export default connect(mapStateToProps, {
    loadCollection,
    loadNodeL1,
    addNode,
    connectNodes,
    updateNode,
    setActiveNode,
    toggleCollapse,
})(NodeViewContainer)
