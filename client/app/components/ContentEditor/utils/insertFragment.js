import { EditorState, Modifier } from 'draft-js'

export default function insertFragment(editorState, fragment) {
  let newContent = Modifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    fragment
  );
  return EditorState.push(
    editorState,
    newContent,
    'insert-fragment'
  );
}
