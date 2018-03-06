/**
 *
 * ConnectWindow
 *
 */

import React from 'react';

import styles from './styles.css';

import { Dialog } from 'material-ui'
import { FlatButton } from '../button'
import { ControlledTextField } from '../Input'
import NodeSearch from '../../containers/NodeSearch'
import { Entity, RichUtils } from 'draft-js';

const ENTITY_TYPE = 'CONTENT_LINK'

// TODO: this redux pattern for modals can be generalized into a HOC - 2016-07-12
class ConnectWindow extends React.Component {

    constructor(props) {
        super(props);

        this.createContentLinkEntity = this.createContentLinkEntity.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.disconnectNodes = this.disconnectNodes.bind(this)
        this.connectNodes = this.connectNodes.bind(this)

        this.state = {
            active: false, // button active state
            open: false, // state of the modal
        }
    }


    createContentLinkEntity(nodeId, edgeId) {
        const { editorState, setEditorState } = this.props
        const contentState = editorState.getCurrentContent()

        const selection = editorState.getSelection();

        const newContentState = contentState.createEntity(ENTITY_TYPE, 'IMMUTABLE', { nodeId, edgeId });
        const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity')

        setEditorState(RichUtils.toggleLink(newEditorState, selection, newContentState.getLastCreatedEntityKey()));
    }

    handleCancel() {
        this.props.hideConnectWindow()
    }

    disconnectNodes(nodeId) {
        // TODO: determine if current selection is a CONTENT_LINK, if so, remove the edge and the content block - 2016-07-07

    }

    connectNodes(node) {

        const editorState = this.props.editorState;
        const selection = editorState.getSelection();
        if (selection.isCollapsed()) {
            return;
        }

        const block = editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey());

        const text = block.getText()

        // TODO: how do we handle links from non-text? - 2016-07-08

        this.props.addEdge(this.props.id, node._id, text)
            .then(action => {
                this.createContentLinkEntity(node._id, action.response.result)
            })
            .catch(error => console.error(error.stack))

        this.props.hideConnectWindow()

        // TODO: focus on editor after close - 2016-07-08
        // this.props.focusEditor()
    }
    render() {

        const actions = [
            <FlatButton
                onClick={this.handleCancel}
            >Cancel</FlatButton>,
        ];

        return (
            <div>
                <Dialog
                    title="Search for a Node"
                    actions={actions}
                    modal={false}
                    open={this.props.open}
                    onRequestClose={this.handleClose}
                >
                    <NodeSearch
                        id={this.props.id}
                        onSearchClick={this.connectNodes}
                        className={"connectWindow-nodeSearch"}
                        nodeSearchListClass={"connectWindow-nodeSearch-list"}
                    />
                </Dialog>
            </div>
        );
    }
}

export default ConnectWindow;
