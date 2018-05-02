import React, { Component } from 'react'
import { withRouter } from 'react-router'

class SourceGridItem extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            progress: props.source.uploaded ? "100" : "0",
            interrupted: false,
        }
    }

    componentDidMount() {
        const { source } = this.props
        if (!source.uploaded) {
            if (source.localState && source.localState.file) {
                // file was added, start uploading
                this.uploadFile(source.file);
            }
            else {
                // upload was interrupted (with a page reload), so recreate File object and ask user to retry
                // TODO: render a retry box - 2018-05-02
                this.setState({ interrupted: true })
            }

        }
    }

    uploadFile = (file) => {
        // TODO: avoid uploading a file multiple times - 2018-05-01
        let body = new FormData()
        body.append('files', file)

        let xhr = new XMLHttpRequest()
        xhr.open('POST', '/upload')
        xhr.onload = () => {
            const jsonResponse = JSON.parse(xhr.responseText)

            // mark source as being uploaded
            this.props.updateSource(this.props.source.id, {
                url: jsonResponse.url,
                uploaded: true,
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

    onClick = () => {
        if (!this.props.source.uploaded) {
            return;
        }

        this.props.history.push(`/app/sources/${this.props.source.id}`)
    }

    render() {
        const { source } = this.props
        const { progress, interrupted } = this.state

        let content;
        if (!source.uploaded && interrupted) {
            content = (
                <div className="SourceGrid-item__interrupted">
                    <span>The upload was interrupted, try again</span>
                </div>
            )
        }
        else if (!source.uploaded) {
            content = (
                <div className="SourceGrid-item__progress">
                    <span>{ progress }</span>
                </div>
            )
        }
        else {
            content = (
                <div className="SourceGrid-item__content" onClick={this.onClick}>
                    <span>{source.name}</span>
                </div>
            )
        }

        return (
            <div
                className="SourceGrid-item"
                onClick={this.onClick}
            >
                { content }
            </div>
        )
    }
}

export default withRouter(SourceGridItem)

