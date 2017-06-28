import React from 'react';
import { connect } from 'react-redux';

import {
    loadNode,
    loadCollection,
    connectNodes,
    updateNode
} from '../../actions/async'

import {
    addNode,
    setActiveNode,
} from '../../actions/ui'

import NodeView from '../NodeView'

function loadData(props) {
    return props.loadCollection(props.collectionId)
        .then((action) => {
            if (props.nodeId) {
                props.loadNode(props.nodeId)
                return action
            }
            return action
        })
}


export class CollectionDetail extends React.Component {

    componentWillMount() {
        loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.collectionId !== this.props.collectionId) {
            loadData(nextProps)
        }

        // if (nextProps.nodeId !== this.props.nodeId) {
        //     this.props.loadNode(nextProps.nodeId)
        // }

    }

    render() {
        const {
            collection,
            nodes,
            links,
            loadingStates,
            focus,
            mode,
        } = this.props

        return (
            <NodeView 
                graphType={"collection"}
                isLoading={loadingStates.GET_COLLECTION || loadingStates.GET_NODE}
                collection={collection}
                nodes={nodes}
                links={links}
                mode={mode}
                focus={focus}

                addNode={this.props.addNode}
                connectNodes={this.props.connectNodes}
                updateNode={this.props.updateNode}
                setActiveNode={this.props.setActiveNode}
            />
        )
    }
}

import {
    getCollection,
    getNodesByCollectionId,
    getEdgesByCollectionId,
} from '../../reducers'

function mapStateToProps(state, props) {
    const collectionId = props.match.params && props.match.params.id
    const nodeId = props.match.params && props.match.params.nodeId

    return {
        collectionId,
        nodeId,
        mode: state.graphUiState.mode,
        focus: state.graphUiState.focus,
        collection: getCollection(state, collectionId),
        nodes: getNodesByCollectionId(state, collectionId),
        links: getEdgesByCollectionId(state, collectionId),
        loadingStates: state.loadingStates
    }
}

export default connect(mapStateToProps, {
    loadCollection,
    loadNode,
    addNode,
    connectNodes,
    updateNode,
    setActiveNode,
})(CollectionDetail);
