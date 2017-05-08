/**
 *
 * AddNodeToCollectionWindow
 *
 */

import React, { PropTypes } from 'react';

import './styles.css';

import { withRouter } from 'react-router'
import { FlatButton, Dialog } from 'material-ui'
import { ControlledTextField } from '../Input'
import NodeSearch from '../../containers/NodeSearch'
import { Entity, RichUtils } from 'draft-js';

import { RaisedButton, AddNodeWithRelationButton } from '../../components/Buttons'

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
class AddNodeToCollectionWindow extends React.Component {

    constructor(props) {
        super(props);

        this.handleCancel = this.handleCancel.bind(this)
        this.addNodeWithCollection = this.addNodeWithCollection.bind(this)
        this.addNodeToCollection = this.addNodeToCollection.bind(this)

        this.state = {
            active: false, // button active state
            open: false, // state of the modal
        }
    }

    handleCancel() {
        this.props.hideWindow()
    }

    addNodeToCollection(ESNode) {
        const { collection } = this.props
        this.props.addNodeToCollection(collection.id, ESNode._id)
        this.props.hideWindow()
    }

    addNodeWithCollection() {
        const { collection } = this.props
        this.props.createNode()
            .then(action => action.response.result)
            .then(id => (
                this.props.addNodeToCollection(collection.id, id).then(() => id)
            ))
            .then(id => this.props.router.push(`/app/collections/${collection.id}/nodes/${id}`))
            // .then((id) => this.props.showGraphSideBar(id))

        this.props.hideWindow()
    }


    render() {
        const { collection } = this.props

        if (!collection) {
            return null
        }

        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleCancel}
            />,
        ];

        return (
            <Dialog
                title={`Add a node to "${collection.properties.name}"`}
                actions={actions}
                modal={false}
                open={this.props.open}
                onRequestClose={this.handleClose}
            >
                <div className={"AddNodeToCollectionWindow"}>

                    <h3>An existing node</h3>
                    <div className={"AddNodeToCollectionWindow-nodeSearch"}>
                        <NodeSearch
                            id={this.props.id}
                            onSearchClick={this.addNodeToCollection}
                        />
                    </div>
                    <OrDivider />
                    <h3>A new node</h3>
                    <RaisedButton
                        label="Create Node"
                        onTouchTap={this.addNodeWithCollection}

                    />
                </div>
            </Dialog>
        );
    }
}
AddNodeToCollectionWindow.propTypes = {
    id: PropTypes.string.isRequired,
    hideAddRelationWindow: PropTypes.func.isRequired,
    addEdge: PropTypes.func.isRequired,
    editorState: PropTypes.object.isRequired,
    setEditorState: PropTypes.func.isRequired,
};

export default withRouter(AddNodeToCollectionWindow);
