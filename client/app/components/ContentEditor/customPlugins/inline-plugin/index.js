import React from 'react';
import styles from './styles.css';
import { RichUtils, EditorState } from 'draft-js';

import InlineControls from './InlineControls';

export default (config) => {
    return {
        handleKeyCommand(command, { getEditorState, setEditorState }) {
            const newState = RichUtils.handleKeyCommand(getEditorState(), command);
            if (newState) {
                setEditorState(newState);
                return 'handled';
            }
            return 'not-handled';
        }
    }
}

const inlineStyles = {
    bold: { label: 'Bold', button: <b>B</b>, style: 'BOLD' },
    italic: { label: 'Italic', button: <i>I</i>, style: 'ITALIC' },
    underline: { label: 'Underline', button: <u>U</u>, style: 'UNDERLINE' },
    monospace: { label: 'Monospace', button: 'Monospace', style: 'MONOSPACE' },
}

export const BoldButton = InlineControls(inlineStyles['bold'])
export const ItalicButton = InlineControls(inlineStyles['italic'])
export const UnderlineButton = InlineControls(inlineStyles['underline'])
export const MonospaceButton = InlineControls(inlineStyles['monospace'])

