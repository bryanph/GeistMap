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
            console.log(nextProps);
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
                links={edges}
                mode={mode}
                focus={focus}

                addNode={this.props.addNode}
                connectNodes={this.props.connectNodes}
                updateNode={this.props.updateNode}
                setActiveNode={this.props.setActiveNode}
            />
        );
    }
}


import {
    getL1Nodes,
    getL1Edges,
    getCollection,
    getNodesByCollectionId,
    getEdgesByCollectionId,
} from '../../reducers'

function mapStateToProps(state, props) {
    const collectionId = props.match.params && props.match.params.collectionId
    const nodeId = props.match.params && props.match.params.nodeId

    let nodes, edges, isLoading, graphType;

    if (collectionId) {
        // loading a collection id
        nodes = getNodesByCollectionId(state, collectionId);
        edges = getEdgesByCollectionId(state, collectionId);
        isLoading = state.loadingStates.GET_COLLECTION || state.loadingStates.GET_NODE
        graphType = "node"
    } else {
        nodes = getL1Nodes(state, nodeId);
        edges = getL1Edges(state, nodeId);
        isLoading = state.loadingStates.GET_NODE_L1
        graphType = "collection"
    }

    console.log(graphType);

    return {
        collectionId,
        nodeId,
        mode: state.graphUiState.mode,
        focus: state.graphUiState.focus,
        nodes,
        edges,
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
})(NodeViewContainer)
