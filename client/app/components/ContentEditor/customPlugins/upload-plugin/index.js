import React from 'react';

import { RichUtils } from 'draft-js'
import { EditorState, Entity, AtomicBlockUtils } from 'draft-js'

import InsertAtomicBlockCustomType from '../../utils/insertAtomicBlockCustomType'

import { insertDataBlock } from '../../utils/block'

import Dropzone from 'react-dropzone'

import Media from './components/media';
import { Audio, Video, Image } from './components/media'

const insertFiles = (getEditorState, setEditorState) => (files) => {
    files.forEach(file => {
        const src = file.url
        let type;

        // TODO: more accurate mimetype detection, like in media-plugin - 2016-08-04
        if (file.mimetype.startsWith('image/')) {
            type = 'image'
        } else if (file.mimetype.startsWith('video/')) {
            type = 'video'
        } else if (file.mimetype.startsWith('audio/')) {
            type = 'audio'
        }

        if (!type) {
            // TODO: not a recognized type, instead add as attachment - 2016-08-04
            return;
        }

        setEditorState(
            insertDataBlock(
                getEditorState(),
                {
                    type,
                    src,
                    file,
                    uploaded: true,
                }
            )
        )
    })
}

const handleDroppedFiles = (getEditorState, setEditorState, handleUpload) => (
    function handleDroppedFiles(
        selection: SelectionState,
        files: Array<Blob>,
        cb?: Function,
    ) : boolean {
            // upload files

            // TODO: check #files and max size before attempting upload.. - 2016-08-04

            let body = new FormData()
            files.forEach(file => {
                body.append('files', file)
            })

            handleUpload(
                body,
                (files) => {
                    // now render to the user's screen from the url provided by the server...

                    insertFiles(getEditorState, setEditorState)(files)

                    if (cb) {
                        cb()
                    }
                },
                (error) => {
                    // notify user that uploading files has failed...
                    console.error(error.stack);
                },

            )

            return true

        }
)

const handlePastedFiles = (getEditorState, setEditorState, handleUpload) => (
    function handlePastedFiles(
        files: Array<Blob>,
    ) : boolean {
            // upload files

            // TODO: check #files and max size before attempting upload.. - 2016-08-04

            let body = new FormData()
            files.forEach(file => {
                body.append('files', file)
            })

            handleUpload(
                body,
                (files) => {
                    // now render to the user's screen from the url provided by the server...

                    insertFiles(getEditorState, setEditorState)(files)
                },
                (error) => {
                    // notify user that uploading files has failed...
                    console.error(error.stack);
                },

            )

            return true

        }
)

export default (config = {}) => {

    const handleUpload = config.handleUpload

    if (!handleUpload) {
        throw new Error("handleUpload is required")
    }

    return ({ getEditorState, setEditorState }) => {
        // const type = config.type || 'block-image';
        // const theme = config.theme ? config.theme : styles;

        return {
            handleDroppedFiles: handleDroppedFiles(getEditorState, setEditorState, handleUpload),
            handlePastedFiles: handlePastedFiles(getEditorState, setEditorState, handleUpload),
        };
    }
}


export class UploadPhotoButton extends React.Component {

}

export class UploadVideoButton extends React.Component {

}


import { withSocket } from '../../../../socket'
import QRCode from 'qrcode.react'

export const UploadQRButton = withSocket(class extends React.Component {
    constructor(props) {
        super(props)

        this.handleMobileUpload = this.handleMobileUpload.bind(this)
        this.insertFiles = insertFiles(
            props.getEditorState,
            props.setEditorState,
        ).bind(this)

        this.state = {}
    }

    handleMobileUpload(files, cb) {
        const editorState = this.props.getEditorState()
        const selectionState = editorState.getSelection()

        this.insertFiles(files)
        cb('ack')
        this.props.onSuccess()
    }

    componentWillMount() {
        // this.props.getMobileUploadToken()
        //     .then((token) => {
        //         this.setState({ token })
        //     })
        
        this.props.socket.emit('User.generateMobileUploadToken', 'get')
            .then(token => {
                this.setState({ token })
            })

        this.props.socket.on('mobileUpload', this.handleMobileUpload)
    }

    componentWillUnmount() {
        this.props.socket.off('mobileUpload', this.handleMobileUpload)
    }

    render() {
        const divClass = this.props.theme.div;
        const token = this.state.token

        // if (!token) return null

        const uploadUrl = `${location.protocol}//${location.host}/upload/mobile/${this.props.url}/${token}`

        return (
            <div className={divClass} style={{width: '100%'}}>
                <QRCode value={uploadUrl} size={256}/>
                { /* <a href={uploadUrl}>{uploadUrl}</a> */ }
            </div>
        )
    }
})
UploadQRButton.defaultProps = {
    theme: {}
}

export class UploadButton extends React.Component {
    constructor(props) {
        super(props)

        this.onDrop = this.onDrop.bind(this)
        this.handleDroppedFiles = handleDroppedFiles(
            props.getEditorState,
            props.setEditorState,
            props.handleUpload,
        ).bind(this)
    }

    onDrop(files) {
        const editorState = this.props.getEditorState()
        const selectionState = editorState.getSelection()

        this.handleDroppedFiles(selectionState, files, this.props.onSuccess)

    }

    render() {
        const divClass = this.props.theme.div;
        const dropzoneClass = this.props.theme.dropzone;
        const dropzoneActiveClass = this.props.theme.dropzoneActive;
        return (
            <div className={divClass}>
                <Dropzone 
                    onDrop={this.onDrop}
                    className={dropzoneClass}
                    activeClassName={dropzoneActiveClass}
                    accept={this.props.accept || '*'}
                >
                    <div>Drop files here or click to select manually</div>
                </Dropzone>
            </div>
        )
    }
}

