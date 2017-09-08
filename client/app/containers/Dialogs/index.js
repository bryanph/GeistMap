/*
 *
 * Dialogs
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import AddRelationWindow from '../../components/AddRelationWindow'

export class Dialogs extends React.Component { // eslint-disable-line react/prefer-stateless-function
    render() {
        const { uiState } = this.props

        console.log(this.props);

        // TODO: this module is overly generic
        return (
            <div>
                <AddRelationWindow
                    id={uiState.windowProps.nodeId}
                    open={uiState.addRelationWindowOpened}
                    createNode={this.props.createNode}
                    connectNodes={this.props.connectNodes}
                    addEdge={this.props.addEdge}
                    hideWindow={this.props.hideAddRelationWindow}
                    fromCollectionDetail={this.props.location.pathname.startsWith('/app/collection')}
                    collectionId={this.props.match.params.id}
                    addNodeToCollection={this.props.addNodeToCollection}

                    editorState={uiState.windowProps.editorState}
                    setEditorState={this.props.setEditorState}
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

import {
    createNode,
    addEdge,
    connectNodes,
} from '../../actions/node'
import {
    createCollection,
    addNodeToCollection,
} from '../../actions/collection'

import {
    hideCreateCollectionWindow,
    hideAddRelationWindow,
    hideAddNodeToCollectionWindow,
    setEditorState
} from '../../actions/ui'

export default connect(mapStateToProps, { 
    createNode,
    createCollection,
    connectNodes,
    addNodeToCollection,
    addEdge,
    hideCreateCollectionWindow,
    hideAddRelationWindow,
    hideAddNodeToCollectionWindow,
    setEditorState,
})(withRouter(Dialogs));
