import React, { Component } from 'react'

import { connect } from "react-redux"

import "./styles.scss"

import SourcesLoader from '../SourcesLoader'

import {
    addSource,
    updateSource,
    removeSource,
} from '../../actions/source'

class SourceGridItem extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            progress: props.uploaded ? "100" : "0",
        }
    }

    componentDidMount() {
        if (!this.props.uploaded) {
            this.uploadFile(this.props.file);
        }
    }

    uploadFile = (file) => {
        let body = new FormData()
        body.append('files', file)

        let xhr = new XMLHttpRequest()
        xhr.open('POST', '/upload')
        // xhr.setRequestHeader("Content-type", "form-data");
        xhr.onload = () => {
            console.log(xhr.status, xhr.responseText)
            const jsonResponse = JSON.parse(xhr.responseText)
            console.log(jsonResponse)

            // mark source as being uploaded
            this.props.updateSource(this.props.source.id, {
                fileName: jsonResponse.filename,
                originalName: jsonResponse.originalname,
                url: jsonResponse.url,
                uploaded: true,
                file: null,
            })
        }
        xhr.onerror = this.onError
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100)
                this.setState({ progress: percent })
            }
        }

        xhr.send(body)
    }

    render() {
        const {  } = this.props
        const { progress } = this.state

        return (
            <div className="SourceGrid-item">
                <span>{ progress }</span>
            </div>
        )
    }
}

import Dropzone from 'react-dropzone'
class SourceGridPlaceholder extends React.Component {
    /*
     * For adding a new source
     * User can either
     * 1. click to add a new source (a popup)
     * 2. drag a source to the grid area to upload it
     *
     *
    */
    constructor(props) {
        super(props)
    }

    onSuccess = (files) => {
        // now render to the user's screen from the url provided by the server...

        insertFiles(getEditorState, setEditorState)(files)

        if (cb) {
            cb()
        }
    }

    onError = (error) => {
        // TODO: notify user that uploading files has failed...
        console.error(error.stack);
    }

    allowed = [ "application/pdf" ]
    checkAllowed = (files) => {
        return files.every(file => allowed.includes(file.type))
    }

    onDrop = (files) => {
        // TODO: Let user choose between hosting local or uploading it - 2018-04-30
        files.forEach(file => {
            this.props.addSource({
                name: file.name,
                type: file.type,
            }, file)

        })
    }

    render() {
        const {  } = this.props

        return (
            <Dropzone 
                className="SourceGrid-item SourceGrid-placeholder"
                activeClassName="active"
                acceptClassName="accepted"
                rejectClassName="rejected"
                onDrop={this.onDrop}
                accept={this.allowed}
            >
                {({ isDragActive, isDragAccept, isDragReject}) => {
                    return (
                        <div>
                            <i className="fa fa-plus" />
                        </div>
                    )
                }}
            </Dropzone>
        )
    }
}

class SourceGrid extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { sources } = this.props

        return (
            <div className="SourceGrid">
                <SourceGridPlaceholder
                    addSource={this.props.addSource}
                />
                {
                    sources.map(source =>
                        <SourceGridItem
                            source={source}
                            updateSource={this.props.updateSource}
                            removeSource={this.props.removeSource}
                        />)
                }
            </div>
        )
    }
}

class SourceGridView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <SourcesLoader>
                { sources => (
                    <SourceGrid 
                        sources={sources} 
                        addSource={this.props.addSource}
                        updateSource={this.props.updateSource}
                        removeSource={this.props.removeSource}
                    />
                )}
            </SourcesLoader>
        )
    }
}

export default connect(null, {
    addSource,
    updateSource,
    removeSource,
})(SourceGridView)
