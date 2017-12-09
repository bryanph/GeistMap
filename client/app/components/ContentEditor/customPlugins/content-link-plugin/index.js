import React from 'react';
import linkStrategy from './linkStrategy';
import ContentLink from './ContentLink';
import ContentLinkButton from './ContentLinkButton';
import styles from './styles.css';
import { EditorState, Entity, KeyBindingUtil, AtomicBlockUtils, SelectionState, Modifier } from 'draft-js'

import { insertContentLink, isActive } from './insertContentLink.js'

function keyBindingFn(e) {
    if (e.keyCode === 75 && e.shiftKey && KeyBindingUtil.isCtrlKeyCommand(e)) { // ctrl-l
        return 'content-link'
    }

    return null
}


const linkPlugin = (config = {}) => {
    const theme = config.theme || styles;

    function handleKeyCommand(
        command: string,
        editorState: EditorState,
        { setEditorState }
    ): DraftHandleValue {
        if (command === 'content-link') {
            setEditorState(insertContentLink(editorState, {
                nodeId: config.nodeId,
                showAddRelationWindow: config.showAddRelationWindow,
                removeEdge: config.removeEdge,
            }), true)
            return 'handled'
        }

        return 'not-handled'
    }


    return ({ getEditorState, setEditorState, getReadOnly, setReadOnly, getClipboard, focus }) => {

        return {
            decorators: [{
                strategy: linkStrategy,
                component: (props) => <ContentLink {...props} theme={theme} getEditorState={getEditorState} setEditorState={setEditorState} getReadOnly={getReadOnly}/>,
            }],
            keyBindingFn: keyBindingFn,
            handleKeyCommand: (command, editorState) => handleKeyCommand(command, editorState, { setEditorState }),
        }
    }
};

export ContentLinkButton from './ContentLinkButton'

export default linkPlugin;

