import React from 'react';
import linkStrategy from './linkStrategy';
import Link from './Link';
import LinkButton from './LinkButton';
import styles from './styles.css';
import { EditorState, Entity, KeyBindingUtil, AtomicBlockUtils, SelectionState, Modifier } from 'draft-js'

import { insertLink, isActive } from './insertLink.js'

function keyBindingFn(e) {
    if (e.keyCode === 75 && KeyBindingUtil.isCtrlKeyCommand(e)) { // ctrl-l
        return 'link'
    }

    return null
}
function handleKeyCommand(
    command: string, 
    editorState: EditorState, 
    { setEditorState }
): DraftHandleValue {
    if (command === 'link') {
        setEditorState(insertLink(editorState))
        return 'handled'
    }
    return 'not-handled'
}

const linkPlugin = (config = {}) => {
  const theme = config.theme || styles;

  return ({ setEditorState, setReadOnly, getClipboard, focus }) => {
      return {
          decorators: [{
              strategy: linkStrategy,
              component: (props) => <Link {...props} theme={theme} />,
          }],
          keyBindingFn: keyBindingFn,
          handleKeyCommand: (command, editorState) => handleKeyCommand(command, editorState, { setEditorState }),
      }
  }
};

export LinkButton from './LinkButton'

export default linkPlugin;

