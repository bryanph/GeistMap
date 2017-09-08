/*
 *
 * NodeEditorToolbar
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import {HotKeys} from 'react-hotkeys';

import { EditButton, GraphButton, ExploreButton, CollectionGraphButton, TrashButton, DuplicateButton, AddRelationButton } from '../../components/Buttons'
import SavedState from '../../containers/SavedState'
import Spinner, { InlineSpinner } from '../../components/Spinner'

import { accentColor } from '../../containers/App/muitheme'

import './styles.scss'

import EditableTitle from '../../components/EditableTitle'
import moment from 'moment'

const NodeTitle = ({ title, updateNode }) => (
    <EditableTitle 
        title={title}
        updateNode={updateNode}
    />
)
const NodeSubtitle = ({ node }) => (
    <span className="nodeToolbar-subtitle">
        { moment.unix(node.modified / 1000).fromNow() } 
    </span>   
)

export class NodeEditorToolbar extends React.Component {
    constructor(props) {
        super(props)

        this.removeNode = this.removeNode.bind(this)
        this.exploreNode = this.exploreNode.bind(this)
        this.addRelation = this.addRelation.bind(this)
    }

    removeNode() {
        const result = window.confirm(`Are you sure you want to remove '${this.props.node.name}'`)
        if (result) {
            this.props.removeNode(this.props.node.id)
        }
    }

    addRelation() {
        this.props.showAddRelationWindow(this.props.node.id)
    }

    exploreNode() {
        this.props.history.push(`/app/nodes/${this.props.node.id}`)
    }

    render() {
        const { node, loadingStates } = this.props

        // if (loadingStates.GET_NODE || !node) {
        //     return <Spinner />
        // }

        // keymapping handlers, see App.js
        const handlers = {
            'explore': this.exploreNode,
            'addRelation': this.addRelation,
            'trash': this.removeNode,
        }

        return (
            <HotKeys focused={true} attach={document.getElementById('root')} handlers={handlers} style={{ width: '100%' }}>
                <div className="nodeToolbar">
                    <div className="nodeToolbar-loadingState">
                        <SavedState />
                        { loadingStates.GET_NODE ? <InlineSpinner size={1} /> : null }
                    </div>
                    <div className="nodeToolbar-title">
                        <NodeTitle
                            title={this.props.node.name} 
                            updateNode={this.props.updateNode.bind(this, this.props.node.id)}
                        />
                        <NodeSubtitle
                            node={this.props.node}
                        />
                    </div>
                    <div className="nodeToolbar-cardActions">
                        {
                            this.props.page !== "nodes" ?
                                <ExploreButton
                                    onClick={this.exploreNode}
                                />
                                : null
                        }
                        <AddRelationButton
                            onClick={this.addRelation}
                        />
                        <TrashButton
                            onClick={this.removeNode}
                        />
                    </div>
                </div>
            </HotKeys>
        );
    }
}

import { getNode } from '../../reducers'
import { updateNode, removeNode, removeEdge } from '../../actions/node'
import { showAddRelationWindow } from '../../actions/ui'

function mapStateToProps(state, props) {
    const id = props.id || (props.match.params && props.match.params.id)

    const selectedNode = getNode(state, id)

    return {
        opened: state.uiState.showGraphSideBarOpened,
        node: selectedNode,
        loadingStates: state.loadingStates,
    }
}

export default withRouter(connect(mapStateToProps, {
    updateNode,
    removeNode,
    removeEdge,
    showAddRelationWindow
})(NodeEditorToolbar))
