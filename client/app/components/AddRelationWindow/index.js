
/**
 *
 * AddRelationWindow
 *
 */

import React from 'react';

import './styles.css';

import { withRouter } from 'react-router-dom'
import { FlatButton, Dialog } from 'material-ui'
import { ControlledTextField } from '../Input'
import NodeSearch from '../../containers/NodeSearch'
import { Entity, RichUtils } from 'draft-js';

import { AddNodeWithRelationButton } from '../../components/Buttons'

import { getTextSelection } from '../ContentEditor/utils/selection.js'

const ENTITY_TYPE = 'CONTENT_LINK'

const styles = {
    surroundingDiv: {
        margin: "3rem 0",
        borderBottom: "1px solid #cacaca",
        lineHeight: 0,
        textAlign: 'center',
    },
    span: {
        background: "#fff",
        padding: "0 0.5rem",
    }
}
export const OrDivider = (props) => (
    <div style={styles.surroundingDiv}>
        <span style={styles.span}>Or</span>
    </div>
)

// TODO: this redux pattern for modals can be generalized into a HOC - 2016-07-12
class AddRelationWindow extends React.Component {

    constructor(props) {
        super(props);

        this.handleCancel = this.handleCancel.bind(this)
        this.addNodeWithRelation = this.addNodeWithRelation.bind(this)
        this.addRelation = this.addRelation.bind(this)
        this.addOnlyRelation = this.addOnlyRelation.bind(this)

        // this._createContentLinkEntity = this._createContentLinkEntity.bind(this)
        this.addContentLink = this.addContentLink.bind(this)

        this.state = {
            active: false, // button active state
            open: false, // state of the modal
        }
    }

    handleCancel() {
        this.props.hideWindow()
    }

    addContentLink(node, nodeId, editorState) {
        // a detailed relation
        const selection = editorState.getSelection();
        if (selection.isCollapsed()) {
            return;
        }

        const block = editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey());

        const text = block.getText()

        // TODO: how do we handle links from non-text? - 2016-07-08

        const entityKey = Entity.create(ENTITY_TYPE, 'IMMUTABLE', { node, nodeId, text });

        // force the update
        this.props.setEditorState(RichUtils.toggleLink(editorState, selection, entityKey));

        return Promise.resolve()
    }

    addRelation(nodeId) {
        // a shallow relation
        return this.props.addEdge(this.props.id, nodeId)
        // this.props.hideWindow()
    }

    addOnlyRelation(node, nodeId) {
        const { editorState } = this.props
        const isContentLink = !!this.props.editorState

        isContentLink ?  
            this.addContentLink(node, nodeId, editorState) 
                : this.addRelation(nodeId)

        this.props.hideWindow()
    }

    addNodeWithRelation(selectedText) {
        const { editorState } = this.props
        const isContentLink = !!this.props.editorState

        const nodeToCreate = {
            name: selectedText || "Untitled",
            content: '',
        }

        // TODO: use another approach for this - 2017-08-25
        if (this.props.type === "collection") {
            const { collectionId } = this.props
            this.props.createNode(nodeToCreate)
                .then(action => action.response.entities.nodes[action.response.result])
                .then(node => {
                    return this.props.addNodeToCollection(collectionId, node.id).then(() => node)
                })
                .then(node => (
                    (isContentLink ?  this.addContentLink(node, node.id, editorState) : this.addRelation(node.id)).then(() => node)
                    // this.props.connectNodes(this.props.id, id).then(() => id)
                ))
                // .then(node => this.props.history.push(`/app/collections/${collectionId}/nodes/${node.id}`))
        }
        // in the explore view
        else {
            this.props.createNode(nodeToCreate)
                .then(action => action.response.entities.nodes[action.response.result])
                .then(node => (
                    (isContentLink ?  this.addContentLink(node, node.id, editorState) : this.addRelation(node.id)).then(() => node)
                    // this.props.connectNodes(this.props.id, id).then(() => id)
                ))
                // .then(node => this.props.history.push(`/app/nodes/${node.id}`))
            // .then((id) => this.props.showGraphSideBar(id))

        }

        this.props.hideWindow()
    }


    render() {
        const { open, editorState } = this.props

        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleCancel}
            />,
        ];


        const selectedText = open ? getTextSelection(editorState) : ""

        return (
            <Dialog
                title="Add a relation"
                actions={actions}
                modal={false}
                open={this.props.open}
                onRequestClose={this.handleClose}
                bodyStyle={{ overflowY: 'visible' }}
            >
                <div className={"addRelationWindow"}>
                    <h3>Search for a node or create a new one</h3>
                    <div className={"addRelationWindow-nodeSearch"}>
                        <NodeSearch
                            id={this.props.id}
                            onClick={ (value) => this.addNodeWithRelation(value) }
                            onSearchClick={(ESNode) => this.addOnlyRelation(ESNode, ESNode._id)}
                            initialValue={selectedText}
                        />
                    </div>
                </div>
            </Dialog>
        );
    }
}

export default withRouter(AddRelationWindow);
