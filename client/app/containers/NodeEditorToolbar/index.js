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

import { EditButton, GraphButton, ExploreButton, CollectionGraphButton, TrashButton, DuplicateButton, AddRelationButton, FocusButton } from '../../components/Buttons'
import SavedState from '../../containers/SavedState'
import Spinner from '../../components/Spinner'

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
        this.toGraphView = this.toGraphView.bind(this)
        this.focusNode = this.focusNode.bind(this)
    }

    removeNode() {
        const result = window.confirm(`Are you sure you want to remove '${this.props.node.name}'`)
        if (result) {
            this.props.removeNode(this.props.node.id)
            this.props.history.push(`/app/nodes`)
        }
    }

    addRelation() {
        this.props.showAddRelationWindow(this.props.node.id)
    }

    exploreNode() {
        this.props.history.push(`/app/nodes/${this.props.id}`)
    }

    toGraphView() {
        const { history, page, id } = this.props
        if (page === "node") {
            // explore mode
            history.push(`/app/nodes/${id}`)

        }
        else if (page === "collection") {
            // collection mode
            history.push(`/app/nodes/${this.props.collectionId}/abstract`)
        }
    }

    focusNode() {
        this.props.history.push(`/app/nodes/${this.props.id}/abstract`)
    }

    render() {
        const { node, isLoading } = this.props

        if (isLoading) {
            return (
                <div className="nodeToolbar">
                    <Spinner />
                </div>
            )
        }

        // keymapping handlers, see App.js
        const handlers = {
            'explore': this.exploreNode,
            'addRelation': this.addRelation,
            'trash': this.removeNode,
        }

        return (
            <HotKeys focused={true} attach={document.getElementById('root')} handlers={handlers} className="nodeToolbar">
                    <div className="nodeToolbar-loadingState">
                    </div>
                    <div className="nodeToolbar-title">
                        <NodeTitle
                            title={node.name} 
                            updateNode={this.props.updateNode.bind(this, node.id)}
                        />
                        <NodeSubtitle
                            node={node}
                        />
                    </div>
                    <div>
                        {
                            node.type !== "root" ? 
                                <NodeCollectionList
                                    node={node}
                                    collections={this.props.collections}
                                    rootCollectionId={this.props.rootCollectionId}
                                    visible={node.type !== "root"}
                                />
                                : null
                        }
                    </div>
                    <div className="nodeToolbar-actions">
                        <TrashButton
                            onClick={this.removeNode}
                            disabled={node.type === "root"}
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
    const rootCollectionId = state.user.rootCollectionId

    return {
        collections: getCollectionsByNodeId(state, props.id),
        rootCollectionId,
    }
}

export default withRouter(connect(mapStateToProps, {
    updateNode,
    removeNode,
    removeEdge,
    showAddRelationWindow
})(NodeEditorToolbar))
