
import React from 'react'
import { connect } from 'react-redux'
import ContentEditor from '../../components/ContentEditor'
import { convertToRaw } from 'draft-js';

import { addFile } from '../../actions/file'

class NodeContentEditor extends React.Component {
    constructor(props) {
        super(props)

        this.upload = this.upload.bind(this)
        this.defaultData = this.defaultData.bind(this)
        this.persistState = this.persistState.bind(this)

        // get old data
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
        const { id, node } = this.props

        const newProperties = Object.assign({}, node, {
            editorPlainText: contentState.getPlainText(),
            editorState: JSON.stringify(convertToRaw(contentState))
        })

        this.props.updateNode(id, newProperties)
    }

    render() {
        if (!this.props.node) return null

        return (
            <ContentEditor
                handleUpload={this.upload}
                handleDefaultData={this.defaultData}
                persistState={this.persistState}
                editorState={this.props.node.editorState}
                {...this.props}
            />
        );
    }
}

import {
    hideAddPictureWindow,
    hideAddVideoWindow,
    hideAddAudioWindow,
    hideConnectWindow,
    showAddRelationWindow,
    hideAddRelationWindow,
} from '../../actions/ui'

import {
    createNode,
    addEdge,
    updateNode,
    removeEdge,
} from '../../actions/node'

import {
    addNodeToCollection,
} from '../../actions/collection'

import { isSynced } from '../../reducers'

function mapStateToProps(state) {
    return {
        uiState: state.uiState,
        saved: isSynced(state),
    }
}
import { withRouter } from 'react-router-dom'

export default connect(mapStateToProps, { 
    addEdge,
    hideConnectWindow,
    hideAddPictureWindow,
    hideAddVideoWindow,
    hideAddAudioWindow,
    hideAddRelationWindow,
    updateNode,
    removeEdge,
    showAddRelationWindow,
    addFile,
    createNode,
    addNodeToCollection,
})(withRouter(NodeContentEditor))

