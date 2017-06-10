/*
 *
 * NodeEditorToolbar
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import {HotKeys} from 'react-hotkeys';

import { NodeTitle, NodeSubtitle } from '../../components/NodeToolbar'
import NodeCollectionList from '../../containers/NodeCollectionListContainer'
import { EditButton, GraphButton, ExploreButton, CollectionGraphButton, TrashButton, DuplicateButton, AddRelationButton } from '../../components/Buttons'
import SavedState from '../../containers/SavedState'
import Spinner, { InlineSpinner } from '../../components/Spinner'

import { accentColor } from '../../containers/App/muitheme'

// TODO: share these styles between components - 2016-10-15
const styles = {
    cardTitle: {
        textAlign: 'center'
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        maxWidth: '1000px',
        marginTop: '10px',
        marginRight: '10px'
    },
    collapseButton: {
        zIndex: 99,
        position: 'absolute',
        right: 0,
        top: 0
    },
    nodeTitle: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        color: accentColor
    },
    nodeCollectionList: {
        textAlign: 'center'
    },
    leftBottom: {
        display: 'inline',
        position: 'absolute',
        bottom: '0px',
        left: '30px',
    },
}

export class NodeEditorToolbar extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props)

        this.editNode = this.editNode.bind(this)
        this.editCollection = this.editCollection.bind(this)
        this.toGraphView = this.toGraphView.bind(this)
        this.removeNode = this.removeNode.bind(this)
        this.exploreNode = this.exploreNode.bind(this)
        this.duplicateNode = this.duplicateNode.bind(this)
        this.addRelation = this.addRelation.bind(this)
    }

    editNode() {
        const { history, page, id } = this.props
        history.push(`/app/${page}/${id}/edit`)
    }

    editCollection() {
        const { history, page, collectionId } = this.props
        history.push(`/app/collections/${collectionId}/`)
    }

    toGraphView() {
        const { history, page, id } = this.props
        history.push(`/app/${page}/${id}/`)
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

    duplicateNode() {
        const { history, page, id } = this.props
        this.props.duplicateNode(id, page === "inbox")
            .then(action =>
                history.push(`/app/${page}/${action.response.result}`)
            )
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
            'duplicate': this.duplicateNode,
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
                    <div className="nodeToolbar-collectionList">
                        <NodeCollectionList 
                            id={this.props.node.id}
                            node={this.props.node}
                        />
                    </div>
                    <div className="nodeToolbar-cardActions">
                        <GraphButton
                            onTouchTap={this.toGraphView}
                        />
                        {
                            this.props.page.startsWith('collections') ?
                                <CollectionGraphButton
                                    onTouchTap={this.editCollection}
                                />
                                : null
                        }
                        {
                            this.props.page !== "nodes" ?
                                <ExploreButton
                                    onTouchTap={this.exploreNode}
                                />
                                : null
                        }
                        <AddRelationButton
                            onTouchTap={this.addRelation}
                        />
                        <DuplicateButton
                            onTouchTap={this.duplicateNode}
                        />
                        <TrashButton
                            onTouchTap={this.removeNode}
                        />
                    </div>
                </div>
            </HotKeys>
        );
    }
}

import { getNode } from '../../reducers'
import { updateNode, removeNode, duplicateNode, removeEdge } from '../../actions/async'
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
    duplicateNode,
    removeEdge,
    showAddRelationWindow
})(NodeEditorToolbar))
