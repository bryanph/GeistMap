
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import ContentEditor from '../../components/ContentEditor'
import { convertToRaw } from 'draft-js';

import { addFile } from '../../actions/async'

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
                globalEditorState={this.props.globalEditorState}
                {...this.props}
            />
        );
    }
}

import { getNode } from '../../reducers'
import { hideAddPictureWindow, hideAddVideoWindow, hideAddAudioWindow, hideConnectWindow, showAddRelationWindow } from '../../actions/ui'
import { addEdge, updateNode, removeEdge } from '../../actions/async'

function mapStateToProps(state, props) {
    const id = props.id || (props.match.params && props.match.params.id)

    const node = getNode(state, id)

    return {
        id,
        node,
        uiState: state.uiState,
        globalEditorState: state.editorState,
        ...props,
    }
}
import { withRouter } from 'react-router-dom'

export default withRouter(connect(mapStateToProps, { 
    addEdge,
    hideConnectWindow,
    hideAddPictureWindow,
    hideAddVideoWindow,
    hideAddAudioWindow,
    updateNode,
    removeEdge,
    showAddRelationWindow,
    addFile,
})(NodeContentEditor))

