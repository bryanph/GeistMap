
import getContentStateFragment from 'draft-js/lib/getContentStateFragment'

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
