import React, { Component } from 'react'

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
                fileName: file.name,
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

export default SourceGridPlaceholder
