
/*
 *
 * NodeExploreEditor
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import compose from 'recompose/compose'
import withProps from 'recompose/withProps'

import NodeEditor from '../../containers/NodeContentEditor'
import NodeEditorToolbar from '../../containers/NodeEditorToolbar'

import {
    loadNodeL2,
} from '../../actions/node'

import {
    getNode,
    getCollectionsByNodeId,
} from '../../reducers'

export class NodeExploreEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function
    componentWillMount() {
        this.props.loadNodeL2(this.props.nodeId)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.nodeId && this.props.nodeId !== nextProps.nodeId) {
            this.props.loadNodeL2(nextProps.nodeId)
        }
    }
    render() {
        if (!this.props.node) {
            return null
        }
        
        return (
            <div className="appContainer">
                <NodeEditorToolbar
                    id={this.props.nodeId}
                    page="nodes"
                />
                <div className="contentContainer">
                    <div className="contentContainer-inner">
                        <NodeEditor 
                            id={this.props.nodeId}
                            page="nodes"
                            { ...this.props }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const addProps = withProps(props => {
    const nodeId = props.match.params && props.match.params.nodeId

    return {
        nodeId,
    }
})

function mapStateToProps(state, props) {
    return {
        node: getNode(state, props.nodeId),
        collections: getCollectionsByNodeId(state, props.nodeId)
    }
}

export default compose(
    addProps,
    withRouter,
    connect(mapStateToProps, { 
        loadNodeL2,
    })
)(NodeExploreEditor)
