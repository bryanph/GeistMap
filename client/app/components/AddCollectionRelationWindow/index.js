/**
 *
 * AddCollectionRelationWindow
 *
 */

import React, { PropTypes } from 'react';

import { withRouter } from 'react-router-dom'
import { FlatButton, Dialog } from 'material-ui'
import { ControlledTextField } from '../Input'
import CollectionSearch from '../../containers/CollectionSearch'
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
class AddCollectionRelationWindow extends React.Component {

    constructor(props) {
        super(props);

        this.handleCancel = this.handleCancel.bind(this)
        this.addCollectionWithRelation = this.addCollectionWithRelation.bind(this)
        this.addRelation = this.addRelation.bind(this)

        this.state = {
            active: false, // button active state
            open: false, // state of the modal
        }
    }

    handleCancel() {
        this.props.hideWindow()
    }

    addRelation(nodeId) {
        // a shallow relation
        this.props.connectCollections(this.props.id, nodeId, "to")
        this.props.hideWindow()
    }

    addCollectionWithRelation() {
        const { editorState } = this.props

        if (this.props.fromBatch) {
            this.props.createCollection()
                .then(action => action.response.entities.nodes[action.response.result])
                .then(node => (
                    (isContentLink ?  this.addContentLink(node, node.id, editorState) : this.addRelation(node.id)).then(() => node)
                    // this.props.connectNodes(this.props.id, id, "to", true).then(() => id)
                ))

        } else if (this.props.fromCollectionDetail) {
            const { collectionId } = this.props
            this.props.createNode()
                .then(action => action.response.entities.nodes[action.response.result])
                .then(node => {
                    return this.props.addNodeToCollection(collectionId, node.id).then(() => node)
                })
                .then(node => (
                    (isContentLink ?  this.addContentLink(node, node.id, editorState) : this.addRelation(node.id)).then(() => node)
                    // this.props.connectNodes(this.props.id, id).then(() => id)
                ))
                .then(node => this.props.history.push(`/app/collections/${collectionId}/nodes/${node.id}`))
        }
        else {
            this.props.createNode()
                .then(action => action.response.entities.nodes[action.response.result])
                .then(node => (
                    (isContentLink ?  this.addContentLink(node, node.id, editorState) : this.addRelation(node.id)).then(() => node)
                    // this.props.connectNodes(this.props.id, id).then(() => id)
                ))
                .then(node => this.props.history.push(`/app/nodes/${node.id}`))
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
                onTouchTap={this.handleCancel}
            />,
        ];

        const selectedText = open ? getTextSelection(editorState) : ""

        return (
            <Dialog
                title="Add a collection relation"
                actions={actions}
                modal={false}
                open={this.props.open}
                onRequestClose={this.handleClose}
                bodyStyle={{ overflowY: 'visible' }}
            >
                <div className={"addRelationWindow"}>
                    <h3>Search for a collection</h3>
                    <div className={"addRelationWindow-nodeSearch"}>
                        <CollectionSearch
                            onSearchClick={(ESNode) => this.addRelation(ESNode._id)}
                            initialValue={selectedText}
                        />
                    </div>
                    {
                        /*
                        <OrDivider />
                        <h3>To a new node</h3>
                        <AddNodeWithRelationButton onTouchTap={this.addCollectionWithRelation} />
                        */
                    }
                </div>
            </Dialog>
        );
    }
}
AddCollectionRelationWindow.propTypes = {
    id: PropTypes.string.isRequired,
    hideAddRelationWindow: PropTypes.func.isRequired,
    addEdge: PropTypes.func.isRequired,
    editorState: PropTypes.object.isRequired,
    setEditorState: PropTypes.func.isRequired,
};

export default withRouter(AddCollectionRelationWindow);
