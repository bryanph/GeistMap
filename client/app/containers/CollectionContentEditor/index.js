
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import RichEditor from '../../components/ContentEditor'
import { convertToRaw } from 'draft-js';

class RichEditorContainer extends React.Component {
    constructor(props) {
        super(props)

        this.upload = this.upload.bind(this)
        this.defaultData = this.defaultData.bind(this)
        this.persistState = this.persistState.bind(this)

    }


    upload(body, success, failed, progress) {
        this.props.addFile(body)
            .then((action) => action.response.files)
            .then(success)
            .catch(failed)
    }

    defaultData(blockType) {
        if (blockType === 'block-image') {
            return {
                url: '/whoa.jpg',
            }
        }
        return {};
    }

    persistState(contentState) {
        const { id, collection } = this.props

        const newProperties = Object.assign({}, collection, {
            editorPlainText: contentState.getPlainText(),
            editorState: JSON.stringify(convertToRaw(contentState))
        })

        this.props.updateCollection(id, newProperties)
    }

    render() {
        if (!this.props.collection) {
            return null
        }

        return (
            <RichEditor
                handleUpload={this.upload}
                handleDefaultData={this.defaultData}
                persistState={this.persistState}
                editorState={this.props.collection.editorState}
                globalEditorState={this.props.globalEditorState}
                {...this.props}
            />
        );
    }
}

import { hideAddPictureWindow, hideAddVideoWindow, hideAddAudioWindow, hideConnectWindow, showAddRelationWindow } from '../../actions/ui'
import { addEdge, updateCollection, addFile, removeEdge } from '../../actions/async'

function mapStateToProps(state, props) {
    return {
        uiState: state.uiState,
        ...props,
    }
}

export default connect(mapStateToProps, { 
    addEdge,
    hideConnectWindow,
    hideAddPictureWindow,
    hideAddVideoWindow,
    hideAddAudioWindow,
    updateCollection,
    removeEdge,
    showAddRelationWindow,
    addFile,
})(RichEditorContainer)

