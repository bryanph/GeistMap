import { EditorState, Entity } from 'draft-js';

export default function (editorState, key, data) {
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(key);
    const entityKey = block.getEntityAt(0);

    const newContentState = contentState.mergeEntityData(entityKey, data);
    const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data')

    return EditorState.forceSelection(newEditorState, newEditorState.getCurrentContent().getSelectionAfter());
}
