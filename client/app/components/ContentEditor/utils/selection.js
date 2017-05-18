
import getContentStateFragment from 'draft-js/lib/getContentStateFragment'
import {
    Entity,
    EditorState,
} from 'draft-js';
import {
    getSelectedBlock,
} from './block';

export function getTextSelection(editorState) {
    if (!editorState) {
        return ""
    }
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()

    const fragment = getContentStateFragment(contentState, selection)
    const plaintext = fragment.map((block) => block.getText()).join('\n')

    return plaintext
}

/**
 * This function will return the entity applicable to whole of current selection.
 * An entity can not span multiple blocks.
 */
export function getSelectionEntity(editorState: EditorState): Entity {
    let entity;
    const selection = editorState.getSelection();
    let start = selection.getStartOffset();
    let end = selection.getEndOffset();
    if (start === end && start === 0) {
        end = 1;
    } else if (start === end) {
        start -= 1;
    }
    const block = getSelectedBlock(editorState);

    for (let i = start; i < end; i += 1) {
        const currentEntity = block.getEntityAt(i);
        if (!currentEntity) {
            entity = undefined;
            break;
        }
        if (i === start) {
            entity = currentEntity;
        } else if (entity !== currentEntity) {
            entity = undefined;
            break;
        }
    }
    return entity;
}

export function moveSelectionToEnd(editorState) {
    /*
     * Given a selection, move the cursor to the end and exit the selection
     */
    const selection = editorState.getSelection()

    const newKey = selection.getEndKey()
    const newOffset = selection.getEndOffset()

    let newState = selection
        .merge({
            anchorKey: newKey,
            anchorOffset: newOffset,
            focusKey: newKey,
            focusOffset: newOffset,
        })

    editorState.forceSelection(editorState, newState)
}
