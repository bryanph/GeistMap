import React from 'react';
import { connect } from 'react-redux';

import {
    loadNode,
    connectNodes,
    updateNode,
    removeNode,
    fetchNodeL1,
    removeEdge,
} from '../../actions/node'
import {
    getCollectionL1,
    removeAbstraction,
    moveToAbstraction,
} from '../../actions/collection'

import {
    addNode,
    setActiveNode,
    toggleCollapse,
    setGraphMode,
} from '../../actions/ui'

import NodeView from '../../components/NodeView'

function loadData(props) {
    if (props.collectionId) {
        return props.getCollectionL1(props.collectionId, props.collectionChainIds)
            .then((action) => {
                if (props.nodeId) {
                    props.loadNode(props.nodeId)
                    return action
                }
                return action
            })
    }
    else {
        return props.fetchNodeL1(props.nodeId)
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
        return (
            <NodeView
                { ...this.props }
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
} from '../../reducers'

function mapStateToProps(state, props) {
    const collectionChainIds = props.match.params.collectionChain && props.match.params.collectionChain.split('/')
    const collectionId = collectionChainIds && collectionChainIds[collectionChainIds.length-1]
    const nodeId = props.match.params && props.match.params.nodeId

    console.log("called", collectionChainIds)

    let nodes, edges, collections, visibleCollections, isLoading, graphType, collectionChain;

    if (collectionChainIds) {
        isLoading = state.loadingStates.GET_COLLECTION;
        ({ nodes, collections, visibleCollections, edges, collectionChain } = getNodesAndEdgesByCollectionId(state, collectionId, collectionChainIds))
        graphType = "collection"

    } else {
        isLoading = state.loadingStates.GET_NODE_L1
        nodes = getL1Nodes(state, nodeId);
        collections = []
        visibleCollections = []
        edges = getL1Edges(state, nodeId);
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
        links: edges,
        collections,
        visibleCollections,
        isLoading,
        graphType,
        collectionChain,
        collectionChainIds,
    };
}

export default connect(mapStateToProps, {
    getCollectionL1,
    addNode,
    connectNodes,
    updateNode,
    removeNode,
    removeAbstraction,
    setActiveNode,
    toggleCollapse,
    moveToAbstraction,
    fetchNodeL1,
    removeEdge,
    setGraphMode,
})(NodeViewContainer)
