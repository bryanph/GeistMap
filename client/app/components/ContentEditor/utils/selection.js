
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
