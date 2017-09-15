/*
 *
 * NodeEditorToolbar
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import {HotKeys} from 'react-hotkeys';
import moment from 'moment'

import { EditButton, GraphButton, ExploreButton, CollectionGraphButton, TrashButton, DuplicateButton, AddRelationButton } from '../../components/Buttons'
import SavedState from '../../containers/SavedState'
import Spinner, { InlineSpinner } from '../../components/Spinner'

import './styles.scss'

import EditableTitle from '../../components/EditableTitle'
import NodeCollectionList from '../../containers/NodeCollectionList'


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
            <HotKeys focused={true} attach={document.getElementById('root')} handlers={handlers} className="nodeToolbar">
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
                    <div>
                        <NodeCollectionList
                            node={this.props.node}
                            collections={this.props.collections}
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
            </HotKeys>
        );
    }
}

import { getNode, getCollectionsByNodeId } from '../../reducers'
import { updateNode, removeNode, removeEdge } from '../../actions/node'
import { showAddRelationWindow } from '../../actions/ui'

function mapStateToProps(state, props) {
    const id = props.id

    return {
        opened: state.uiState.showGraphSideBarOpened,
        node: getNode(state, id),
        collections: getCollectionsByNodeId(state, id),
        loadingStates: state.loadingStates,
    }
}

export default withRouter(connect(mapStateToProps, {
    updateNode,
    removeNode,
    removeEdge,
    showAddRelationWindow
})(NodeEditorToolbar))
