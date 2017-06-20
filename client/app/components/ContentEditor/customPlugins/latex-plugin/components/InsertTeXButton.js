import React from 'react';

import {insertTeXBlock} from '../modifiers/insertTeXBlock';

export class InsertTeXButton extends React.Component {
    constructor(props) {
        super(props)

        this.insertTeX = this.insertTeX.bind(this)
    }

    insertTeX() {
        this.props.setEditorState(insertTeXBlock(this.props.editorState))
    }

    render() {
        const className = this.props.theme.button;

        return (
            <button className={className} onMouseDown={this.insertTeX}>
                { this.props.label || "TeX" }
            </button>
        )
    }
}
InsertTeXButton.defaultProps = {
    theme: {
        button: 'add-media-button'
    }
}

export class InsertInlineTeXButton extends React.Component {
    constructor(props) {
        super(props)

        this.insertTeX = this.insertTeX.bind(this)
    }

    insertTeX() {
        this.props.setEditorState(insertTeXBlock(this.props.editorState, true))
    }

    render() {
        const className = this.props.theme.button;

        return (
            <button className={className} onMouseDown={this.insertTeX}>
                { this.props.label || "TeX" }
            </button>
        )
    }
}
InsertInlineTeXButton.defaultProps = {
    theme: {
        button: 'add-media-button'
    }
}
