import React, { Component } from 'react'
import { withRouter } from 'react-router'

class SourceGridItem extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            progress: props.source.uploaded ? "100" : "0",
        }
    }

    componentDidMount() {
        if (!this.props.source.uploaded) {
            this.uploadFile(this.props.file);
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

    onClick = () => {
        if (!this.props.source.uploaded) {
            return;
        }

        this.props.history.push(`/app/sources/${this.props.source.id}`)
    }

    render() {
        const { source } = this.props
        const { progress } = this.state

        console.log(source)

        return (
            <div
                className="SourceGrid-item"
                onClick={this.onClick}
            >
                {
                    !source.uploaded ?
                        <div className="SourceGrid-item__progress">
                            <span>{ progress }</span>
                        </div>
                    :
                        <div className="SourceGrid-item__content" onClick={this.onClick}>
                            <span>{source.name}</span>
                        </div>
                }
            </div>
        )
    }
}

export default withRouter(SourceGridItem)

