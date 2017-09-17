import React from 'react';
import { connect } from 'react-redux';

import compose from 'recompose/compose'
import withProps from 'recompose/withProps'

import {
    loadNode,
    loadNodeL2,
    connectNodes,
    updateNode,
    removeNode,
    fetchNodeL1,
    removeEdge,
} from '../../actions/node'
import {
    loadCollectionL1,
    removeAbstraction,
    moveToAbstraction,
    removeNodeFromCollection,
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
        console.log("loading collection", props.collectionId)
        return props.loadCollectionL1(props.collectionId, props.collectionChainIds)
            .then((action) => {
                console.log("loading node", props.nodeId)
                if (props.nodeId) {
                    props.loadNode(props.nodeId)
                    return action
                }
                return action
            })
    }
    else {
        return props.loadNodeL2(props.nodeId)
    }
}


export class NodeViewContainer extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            hasLoaded: false
        }
        loadData(props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.collectionId !== this.props.collectionId || nextProps.nodeId !== this.props.nodeId) {
            loadData(nextProps)
        }

        // TODO: solve this more general, with a hoc or something - 2017-09-16
        if (!nextProps.isLoading) {
            this.setState({ hasLoaded: true })
        }
    }

    render() {
        return (
            <NodeView
                { ...this.props }
                isLoading={!this.state.hasLoaded || this.props.isLoading}
            />
        );
    }
}


import {
    getL1Nodes,
    getL2Nodes,
    getL2Edges,
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
        isLoading = state.loadingStates.GET_NODE_L1 || state.loadingStates.GET_NODE_L2
        nodes = getL2Nodes(state, props.nodeId);
        collections = []
        visibleCollections = []
        collectionChain = []
        edges = getL2Edges(state, props.nodeId);
        graphType = "node"
    }

    return {
        activeNodeId: props.nodeId,
        activeNode: getNode(state, props.nodeId),
        activeCollectionId: props.collectionId,
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
        loadCollectionL1,
        addNode,
        connectNodes,
        updateNode,
        removeNode,
        removeNodeFromCollection,
        removeAbstraction,
        setActiveNode,
        toggleCollapse,
        moveToAbstraction,
        loadNode,
        loadNodeL2,
        removeEdge,
        setGraphMode,
    })
)(NodeViewContainer)
