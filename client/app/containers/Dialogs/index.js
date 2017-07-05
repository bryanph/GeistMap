/*
 *
 * Dialogs
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import CollectionCreateWindow from '../../components/CollectionCreateWindow'
import AddRelationWindow from '../../components/AddRelationWindow'
import AddCollectionRelationWindow from '../../components/AddCollectionRelationWindow'
import AddNodeToCollectionWindow from '../../components/AddNodeToCollectionWindow'


export class Dialogs extends React.Component { // eslint-disable-line react/prefer-stateless-function
    render() {
        const { uiState } = this.props

        console.log(this.props);

        // TODO: this module is overly generic
        return (
            <div>
                <CollectionCreateWindow
                    defaultValues={uiState.createCollectionWindowState}
                    open={uiState.createCollectionWindowOpened}
                    createCollection={this.props.createCollection}
                    hideWindow={this.props.hideCreateCollectionWindow}
                    onCompleted={(action) => this.props.history.push(`/app/collections/${action.response.result}`)}
                />
                <AddRelationWindow
                    id={uiState.windowProps.nodeId}
                    open={uiState.addRelationWindowOpened}
                    createNode={this.props.createNode}
                    connectNodes={this.props.connectNodes}
                    addEdge={this.props.addEdge}
                    hideWindow={this.props.hideAddRelationWindow}
                    showGraphSideBar={this.props.showGraphSideBar}
                    fromBatch={this.props.location.pathname.startsWith('/app/inbox')}
                    fromCollectionDetail={this.props.location.pathname.startsWith('/app/collection')}
                    collectionId={this.props.match.params.id}
                    addNodeToCollection={this.props.addNodeToCollection}

                    createBatchNode={this.props.createBatchNode}
                    editorState={uiState.windowProps.editorState}
                    setEditorState={this.props.setEditorState}
                />
                <AddCollectionRelationWindow
                    id={uiState.windowProps.collectionId}
                    open={uiState.addCollectionRelationWindowOpened}
                    createCollection={this.props.createCollection}
                    connectCollections={this.props.connectCollections}
                    hideWindow={this.props.hideAddRelationWindow}
                    addNodeToCollection={this.props.addNodeToCollection}
                />
                <AddNodeToCollectionWindow
                    collection={uiState.addNodeToCollectionWindowState.collection}
                    open={uiState.addNodeToCollectionWindowState.opened}
                    createNode={this.props.createNode}
                    addNodeToCollection={this.props.addNodeToCollection}
                    connectNodes={this.props.connectNodes}
                    hideWindow={this.props.hideAddNodeToCollectionWindow}
                    showGraphSideBar={this.props.showGraphSideBar}
                />
            </div>
        );
    }
}

const mapStateToProps = function(state, props) {
    return {
        uiState: state.uiState,
    }
}

import { createNode, createCollection, addEdge, connectNodes, createBatchNode, addNodeToCollection, connectCollections } from '../../actions/async'
import { hideCreateCollectionWindow, hideAddRelationWindow, hideAddNodeToCollectionWindow, showGraphSideBar, setEditorState } from '../../actions/ui'


export default connect(mapStateToProps, { createNode, createBatchNode, createCollection, connectNodes, addNodeToCollection, addEdge, connectCollections, hideCreateCollectionWindow, hideAddRelationWindow, hideAddNodeToCollectionWindow, showGraphSideBar, setEditorState })(withRouter(Dialogs));
