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
    setGraphMode,
    moveChild,
    moveParent,
    resetAbstractionChain,
} from '../../actions/ui'

import NodeView from '../../components/NodeView'

function loadData(props) {
    switch(props.graphType) {
        case "abstract":
        case "hierarchy":
            return Promise.all([
                props.loadCollectionL1(props.collectionId),
                props.loadNodeL1(props.collectionId)
            ])
                .then((action) => {
                    if (props.nodeId) {
                        props.loadNode(props.nodeId)
                        return action
                    }
                    return action
                })
            break;
        case "explore":
            return props.loadNodeL2(props.nodeId)
            break;
        default:
            console.error("got unexpected graphType", props.graphType)
    }
}


export class NodeViewContainer extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            hasLoaded: false
        }

        loadData(props)
            .then(() => {
                if (props.graphType === "abstract") {
                    props.resetAbstractionChain()
                    props.moveChild(props.activeCollectionId)
                }
            })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.collectionId !== this.props.collectionId || nextProps.nodeId !== this.props.nodeId) {
            loadData(nextProps)
            return this.setState({ hasLoaded: false })
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
    getNode,
    getNodesAndEdgesByCollectionId,
    getAbstractionChain,
} from '../../reducers'

function mapStateToProps(state, props) {

    let nodes, edges, nodeTree, isLoading

    const params = new URLSearchParams(props.location.search);
    const graphType = params.get('graphType') || "abstract"

    if (graphType === "abstract" || graphType === "hierarchy") {
        isLoading = state.loadingStates.GET_COLLECTIONL1 || state.loadingStates.GET_NODE_L1;

        ({ nodes, edges, nodeTree } = getNodesAndEdgesByCollectionId(state, props));

    } else {
        isLoading = state.loadingStates.GET_NODE_L1 || state.loadingStates.GET_NODE_L2
        nodes = getL2Nodes(state, props.nodeId);
        edges = getL2Edges(state, props.nodeId);
    }

    return {
        activeNodeId: props.nodeId,
        activeNode: getNode(state, props.nodeId),
        activeCollectionId: props.collectionId,
        activeCollection: getNode(state, props.collectionId),
        mode: state.graphUiState.mode,
        focus: state.graphUiState.focus,
        nodes,
        links: edges,
        nodeTree,
        isLoading,
        graphType: graphType,
        adjacencyMap: state.adjacencyMap, // TODO: should this be passed down? - 2017-09-19
        abstractionSidebarOpened: state.uiState.abstractionSidebar.opened,
        abstractionChain: getAbstractionChain(state),
    };
}

const addProps = withProps(props => {
    const collectionId = props.match.params && props.match.params.collectionId
    const nodeId = props.match.params && props.match.params.nodeId

    return {
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
        loadNodeL1,
        loadNodeL2,
        removeEdge,
        setGraphMode,
        moveChild,
        moveParent,
        resetAbstractionChain,
    })
)(withRouter(NodeViewContainer))
