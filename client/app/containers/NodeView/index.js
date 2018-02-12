import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'

import compose from 'recompose/compose'
import withProps from 'recompose/withProps'

import {
    loadNode,
    loadNodeL1,
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
    moveChild,
    moveParent,
    resetAbstractionChain,
} from '../../actions/ui'

import NodeView from '../../components/NodeView'
import { Dimmer, Loader } from 'semantic-ui-react'

function loadData(props) {
    // TODO: less data fetching based on which views are visible - 2018-01-12
    return Promise.all([
        props.loadCollectionL1(props.focusNodeId),
        props.loadNodeL2(props.focusNodeId),
        props.nodeId ? props.loadNodeL1(props.nodeId) : Promise.resolve(),
    ])
}


export class NodeViewContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            hasLoaded: false
        }

        loadData(props)
            .then(() => {
                if (props.graphType === "abstract") {
                    props.resetAbstractionChain()
                    props.moveChild(props.focusNodeId)
                }
            })
    }

    shouldComponentUpdate(nextProps) {
        // TODO: solve this more general, with a hoc or something - 2017-09-16
        if (nextProps.focusNodeId !== this.props.focusNodeId || nextProps.nodeId !== this.props.nodeId) {
            loadData(nextProps)
            return false;
        }

        return true;
    }

    componentWillReceiveProps(nextProps) {
        // TODO: solve this more general, with a hoc or something - 2017-09-16
        if (!nextProps.isLoading) {
            this.setState({ hasLoaded: true })
        }
    }

    render() {
        if (!this.state.hasLoaded) {
            return (
                <Dimmer active={true} inverted>
                    <Loader />
                </Dimmer>
            )
        }

        return (
            <NodeView
                { ...this.props }
                isLoading={this.props.isLoading}
            />
        );
    }
}


import {
    getL2Nodes,
    getL2Edges,
    getL1Nodes,
    getL1Edges,
    getNode,
    getNodesAndEdgesByCollectionId,
    getAbstractionTree,
    getNodesOutsideAbstraction,
    getEdgesOutsideAbstraction,
    getNodesWithAbstraction,
    getNodesBelowAbstraction,
    getEdgesBelowAbstraction,
    getAbstractionChain,
} from '../../reducers'

function mapStateToProps(state, props) {

    let nodes, edges, nodeTree, isLoading, nodesBelowAbstraction, edgesBelowAbstraction, nodesOutsideAbstraction, edgesOutsideAbstraction, nodesWithAbstraction

    const params = new URLSearchParams(props.location.search);
    const graphType = params.get('graphType') || "abstract"

    isLoading = state.loadingStates.GET_COLLECTIONL1 || state.loadingStates.GET_NODE_L1 || state.loadingStates.GET_NODE_L2;

    if (graphType === "abstract" || graphType === "hierarchy") {

        ({ nodes, edges, nodeTree } = getNodesAndEdgesByCollectionId(state, props));

    } else {
        nodesBelowAbstraction = getNodesBelowAbstraction(state, props)
        nodesWithAbstraction = getNodesWithAbstraction(state, props)
        edgesBelowAbstraction = getEdgesBelowAbstraction(state, props)
        nodesOutsideAbstraction = getNodesOutsideAbstraction(state, props)
        edgesOutsideAbstraction = getEdgesOutsideAbstraction(state, props)
        nodeTree = getAbstractionTree(state, props)
    }

    return {
        nodesBelowAbstraction,
        edgesBelowAbstraction,
        nodesWithAbstraction,
        nodesOutsideAbstraction,
        edgesOutsideAbstraction,
        nodeTree,
        activeNodeId: props.nodeId,
        activeNode: getNode(state, props.nodeId),
        focusNodeId: props.focusNodeId,
        focusNode: getNode(state, props.focusNodeId),
        mode: state.graphUiState.mode,
        focus: state.graphUiState.focus,
        nodes,
        links: edges,
        isLoading,
        graphType: graphType,
        adjacencyMap: state.adjacencyMap, // TODO: should this be passed down? - 2017-09-19
        abstractionSidebarOpened: state.uiState.abstractionSidebar.opened,
        addNodeWindow: state.uiState.addNodeWindow,
        showLinks: state.uiState.showLinks,
        abstractionChain: getAbstractionChain(state),
    };
}

const addProps = withProps(props => {
    const focusNodeId = props.match.params && props.match.params.focusNodeId
    const nodeId = props.match.params && props.match.params.nodeId

    return {
        focusNodeId,
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
        loadNodeL1,
        loadNodeL2,
        removeEdge,
        moveChild,
        moveParent,
        resetAbstractionChain,
    })
)(withRouter(NodeViewContainer))
