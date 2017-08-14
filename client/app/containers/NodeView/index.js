import React from 'react';
import { connect } from 'react-redux';

import {
    loadNode,
    getCollectionL1,
    loadNodeL1,
    connectNodes,
    updateNode,
    removeNode,
    removeAbstraction,
    moveToAbstraction,
    fetchNodeL1,
} from '../../actions/async'

import {
    addNode,
    setActiveNode,
    toggleCollapse,
} from '../../actions/ui'

import NodeView from '../../components/NodeView'

function loadData(props) {
    if (props.collectionId) {
        return props.getCollectionL1(props.collectionId)
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
                visibleCollections={this.props.visibleCollections}
                links={edges}
                mode={mode}
                focus={focus}
                activeNode={this.props.activeNode}
                activeCollection={this.props.activeCollection}

                addNode={this.props.addNode}
                connectNodes={this.props.connectNodes}
                updateNode={this.props.updateNode}
                removeNode={this.props.removeNode}
                removeAbstraction={this.props.removeAbstraction}
                setActiveNode={this.props.setActiveNode}
                toggleCollapse={this.props.toggleCollapse}
                moveToAbstraction={this.props.moveToAbstraction}
                collectionChain={this.props.collectionChain}
                fetchNodeL1={this.props.fetchNodeL1}
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

    let nodes, edges, collections, visibleCollections, isLoading, graphType, collectionChain;

    if (collectionId) {
        // loading a collection id
        // nodes = getNodesAndEdgesByCollectionId(state, collectionId);
        // edges = getEdgesByCollectionId(state, collectionId);
        ({ nodes, collections, visibleCollections, edges, collectionChain } = getNodesAndEdgesByCollectionId(state, collectionId))

        isLoading = state.loadingStates.GET_COLLECTION || state.loadingStates.GET_NODE
        graphType = "collection"
    } else {
        nodes = getL1Nodes(state, nodeId);
        collections = []
        visibleCollections = []
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
        visibleCollections,
        isLoading,
        graphType,
        collectionChain,
    };
}

export default connect(mapStateToProps, {
    getCollectionL1,
    loadNodeL1,
    addNode,
    connectNodes,
    updateNode,
    removeNode,
    removeAbstraction,
    setActiveNode,
    toggleCollapse,
    moveToAbstraction,
    fetchNodeL1,
})(NodeViewContainer)
