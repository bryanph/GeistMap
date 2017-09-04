import React from 'react';
import { connect } from 'react-redux';

import compose from 'recompose/compose'
import withProps from 'recompose/withProps'

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


export class NodeViewContainer extends React.PureComponent {
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
    getCollections,
    getNode,
    getNodesAndEdgesByCollectionId,
    getCollectionChain,
} from '../../reducers'

function mapStateToProps(state, props) {

    let nodes, edges, collections, visibleCollections, isLoading, graphType, collectionChain;

    if (props.collectionChainIds) {
        isLoading = state.loadingStates.GET_COLLECTIONL1;

        collectionChain = getCollectionChain(state, props);
        ({ nodes, collections, visibleCollections, edges} = getNodesAndEdgesByCollectionId(state, props));
        graphType = "collection"

    } else {
        isLoading = state.loadingStates.GET_NODE_L1
        nodes = getL1Nodes(state, nodeId);
        collections = []
        visibleCollections = []
        edges = getL1Edges(state, nodeId);
        graphType = "node"
    }

    console.log('re-rendering?')

    return {
        activeNode: getNode(state, props.nodeId),
        activeCollection: getCollection(state, props.collectionId),
        mode: state.graphUiState.mode,
        focus: state.graphUiState.focus,
        nodes,
        links: edges,
        collections,
        visibleCollections,
        isLoading,
        graphType,
        collectionChain,
    };
}

const addProps = withProps(props => {
    const collectionChainIds = props.match.params.collectionChain && props.match.params.collectionChain.split('/')
    const collectionId = collectionChainIds && collectionChainIds[collectionChainIds.length-1]
    const nodeId = props.match.params && props.match.params.nodeId

    return {
        collectionChainIds,
        collectionId,
        nodeId,
    }
})

export default compose(
    addProps,
    connect(mapStateToProps, {
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
    })
)(NodeViewContainer)
