
/**
 *
 * AddAudioWindow
 *
 */

import React from 'react';

import './styles.css';

import { Entity, RichUtils } from 'draft-js';
import { Dialog } from 'material-ui'
import { withRouter } from 'react-router-dom'

import { FlatButton } from '../button'
import NodeSearch from '../../containers/NodeSearch'

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
        padding: "0 0.5rem"
    },
}
export const OrDivider = (props) => (
    <div style={styles.surroundingDiv}>
        <span style={styles.span}>Or</span>
    </div>
)

import { UploadButton, UploadQRButton } from '../ContentEditor/customPlugins/upload-plugin/index.js'
import { AddMediaInput } from '../ContentEditor/customPlugins/media-plugin/index.js'

// TODO: this redux pattern for modals can be generalized into a HOC - 2016-07-12
class AddAudioWindow extends React.Component {

    constructor(props) {
        super(props);

        this.handleCancel = this.handleCancel.bind(this)

        this.state = {
            active: false, // button active state
            open: false, // state of the modal
        }
    }

    handleCancel() {
        this.props.hideWindow()
    }

    render() {
        const actions = [
            <FlatButton
                onClick={this.handleCancel}
            >Cancel</FlatButton>,
        ];

        return (
            <Dialog
                title="Add a audio"
                actions={actions}
                modal={false}
                open={this.props.open}
                onRequestClose={this.handleCancel}
                autoScrollBodyContent={true}
            >
                <div className={"addAudioWindow"}>
                    <h3>From the web</h3>
                    <AddMediaInput
                        editorState={this.props.getEditorState()}
                        setEditorState={this.props.setEditorState}
                        onSuccess={() => this.handleCancel()}
                    />
                    <OrDivider />
                    <h3>Upload a audio</h3>
                    <UploadButton
                        getEditorState={this.props.getEditorState}  
                        setEditorState={this.props.setEditorState}
                        handleUpload={this.props.handleUpload}
                        theme={{
                            div: 'addAudioWindow-uploadDiv',
                            dropzone: 'addAudioWindow-dropzone',
                            dropzoneActive: 'addAudioWindow-dropzoneActive'
                        }}
                        onSuccess={() => this.handleCancel()}
                        accept="audio/*"
                    />

                    <OrDivider />
                    <h3>From your phone</h3>
                    <UploadQRButton
                        getEditorState={this.props.getEditorState}  
                        setEditorState={this.props.setEditorState}
                        handleUpload={this.props.handleUpload}
                        onSuccess={() => this.handleCancel()}
                        url="audio"
                    />

                </div>
            </Dialog>
        );
    }
}

export default withRouter(AddAudioWindow);

