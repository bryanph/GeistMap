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
function handleKeyCommand(command: string, { getEditorState, setEditorState }): DraftHandleValue {
    if (command === 'link') {
        setEditorState(insertLink(getEditorState()))
        return 'handled'
    }
    return 'not-handled'
}

const linkPlugin = (config = {}) => {
  const theme = config.theme || styles;

  return ({ getEditorState, setEditorState, setReadOnly, getClipboard, focus }) => {
      return {
          decorators: [{
              strategy: linkStrategy,
              component: (props) => <Link {...props} theme={theme} />,
          }],
          keyBindingFn: keyBindingFn,
          handleKeyCommand: (command) => handleKeyCommand(command, { getEditorState, setEditorState }),
      }
  }
};

export LinkButton from './LinkButton'

export default linkPlugin;

