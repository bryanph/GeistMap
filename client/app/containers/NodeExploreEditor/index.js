
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
import GraphTypeSwitcher from '../../components/GraphTypeSwitcher'

import {
    loadNodeL2,
} from '../../actions/node'

import {
    getNode,
    getParents,
} from '../../reducers'

export class NodeExploreEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props)

        this.state = {
            hasLoaded: false
        }

        this.props.loadNodeL2(props.nodeId)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.nodeId && this.props.nodeId !== nextProps.nodeId) {
            this.props.loadNodeL2(nextProps.nodeId)
            return this.setState({ hasLoaded: false })
        }

        if (!nextProps.isLoading) {
            this.setState({ hasLoaded: true })
        }
    }
    render() {
        return (
            <div className="appContainer">
                <NodeEditorToolbar
                    id={this.props.nodeId}
                    page="node"
                    isLoading={!this.state.hasLoaded || this.props.isLoading}
                    node={this.props.node}
                />
                <div className="contentContainer">
                    <div className="contentContainer-inner">
                        <NodeEditor 
                            id={this.props.nodeId}
                            page="node"
                            isLoading={!this.state.hasLoaded || this.props.isLoading}
                            { ...this.props }
                        />
                    </div>
                </div>
                <GraphTypeSwitcher
                    graphType="editor"
                    id={this.props.nodeId}
                />
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
    const isLoading = state.loadingStates.GET_NODE_L2;

    return {
        isLoading,
        node: getNode(state, props.nodeId),
        collections: getParents(state, props.nodeId)
    }
}

export default compose(
    addProps,
    withRouter,
    connect(mapStateToProps, { 
        loadNodeL2,
    })
)(NodeExploreEditor)
