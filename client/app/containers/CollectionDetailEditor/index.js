/*
 *
 * CollectionDetailEditor
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import compose from 'recompose/compose'
import withProps from 'recompose/withProps'

import NodeEditor from '../../containers/NodeContentEditor'
import AbstractionNavigator from '../../components/AbstractionNavigator'
import NodeEditorToolbar from '../../containers/NodeEditorToolbar'

import {
    getNode,
    getCollectionChain,
} from '../../reducers'

import {
    loadCollectionL1
} from '../../actions/collection'

import {
    loadNodeL1
} from '../../actions/node'

export class CollectionDetailEditor extends React.Component {
    componentWillMount() {
        this.props.loadCollectionL1(this.props.collectionId, this.props.collectionChainIds)
        this.props.loadNodeL1(this.props.nodeId)
    }

    componentWillReceiveProps(nextProps) {
        // if (nextProps.nodeId && this.props.nodeId !== nextProps.nodeId) {
        //     this.props.loadNodeL1(nextProps.nodeId)
        // }
        if (nextProps.collectionId && this.props.collectionId !== nextProps.collectionId) {
            this.props.loadCollectionL1(nextProps.collectionId, nextProps.collectionChainIds)
        }
        if (nextProps.nodeId && this.props.nodeId !== nextProps.nodeId) {
            this.props.loadNodeL1(nextProps.nodeId)
        }
    }

    render() {
        if (!this.props.node) {
            return null
        }

        const fullChain = [ ...this.props.collectionChain, this.props.node ]

        return (
            <div className="appContainer">
                <AbstractionNavigator
                    collectionChain={this.props.collectionChain}
                    collection={this.props.collection}
                    extra={true}
                />
                <NodeEditorToolbar
                    id={this.props.nodeId}
                    node={this.props.node}
                    collectionId={this.props.collectionId}
                    collectionChainIds={this.props.collectionChainIds}
                    page="collection"
                />
                <div className="contentContainer">
                    <div className="contentContainer-inner">
                        <NodeEditor 
                            page="collection"
                            id={this.props.nodeId}
                            { ...this.props }
                        />
                    </div>
                </div>
            </div>
        );
    }
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

function mapStateToProps(state, props) {
    return {
        collectionId: props.collectionId,
        collection: getNode(state, props.collectionId),
        collectionChain: getCollectionChain(state, props),
        collectionChainIds: props.collectionChainIds,
        nodeId: props.nodeId,
        node: getNode(state, props.nodeId),
    }
}

export default compose(
    addProps,
    withRouter,
    connect(mapStateToProps, { 
        loadCollectionL1,
        loadNodeL1,
    })
)(CollectionDetailEditor)
