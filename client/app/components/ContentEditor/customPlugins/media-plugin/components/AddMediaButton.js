import React from 'react';
import { insertDataBlock } from '../../../utils/block'
import { Entity } from 'draft-js'

import { getType, transformSrc } from '../utils/getMediaType'

import { InputText } from '../../../../Input'
import RaisedButton from 'material-ui/RaisedButton';


const addMedia = (editorState, setEditorState) => (src, cb?) => {
    if (!src) {
        return;
    }

    const type = getType(src)

    if (!type) {
        // const extension = extensionRe.exec(src)[1]
        window.alert("This type of media is not supported (yet?) for embedding")
        return;
    }

    const transformedSrc = transformSrc(type, src)

    setEditorState(
        insertDataBlock(
            editorState,
            {
                type,
                src: transformedSrc
            }
        )
    )

    if (cb) {
        cb()
    }
}


export class AddMediaInput extends React.Component {
    constructor(props) {
        super(props)
        this.addMedia = addMedia(props.editorState, props.setEditorState)
        this.addMediaFromSrc = this.addMediaFromSrc.bind(this)

        this.state = {
            value: "",
        }
    }

    addMediaFromSrc() {
        this.addMedia(this.state.value, this.props.onSuccess)
    }

    render() {
        return (
            <div>
                <InputText 
                    onChange={e => this.setState({ value: e.target.value })}
                    value={this.state.value}
                    placeholder={"Insert full URL here"}
                />
                <RaisedButton
                    label="Confirm"
                    primary={true}
                    onClick={this.addMediaFromSrc}
                    style={{marginLeft: '15px'}}
                />
            </div>
        )
    }
}

class AddMediaButton extends React.Component {
    constructor(props) {
        super(props)

        this.addMedia = addMedia(props.editorState, props.setEditorState)
        this.addMediaFromSrc = this.addMediaFromSrc.bind(this)
    }

    addMediaFromSrc() {
        const src = window.prompt("Enter a URL (videos, images, audio, youtube, etc.)")
        this.addMedia(src)
    }

    render() {
        const className = this.props.theme.button;
        return (
            <button className={className} onMouseDown={this.addMediaFromSrc}>
                { this.props.label || "Add Media" }
            </button>
        )
    }
}
AddMediaButton.defaultProps = {
    theme: {
        button: 'add-media-button'
    }
}

export default AddMediaButton
