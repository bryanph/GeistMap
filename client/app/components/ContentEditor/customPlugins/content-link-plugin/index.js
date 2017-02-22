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

    function handleKeyCommand(command: string, { getEditorState, setEditorState }): DraftHandleValue {
        if (command === 'content-link') {
            setEditorState(insertContentLink(getEditorState(), {
                nodeId: config.nodeId,
                showAddRelationWindow: config.showAddRelationWindow,
                removeEdge: config.removeEdge,
            }))
            return 'handled'
        }

        return 'not-handled'
    }


    return ({ getEditorState, setEditorState, setReadOnly, getClipboard, focus }) => {

        return {
            decorators: [{
                strategy: linkStrategy,
                component: (props) => <ContentLink {...props} theme={theme} getEditorState={getEditorState} setEditorState={setEditorState} />,
            }],
            keyBindingFn: keyBindingFn,
            handleKeyCommand: (command) => handleKeyCommand(command, { getEditorState, setEditorState }),
        }
    }
};

export ContentLinkButton from './ContentLinkButton'

export default linkPlugin;

