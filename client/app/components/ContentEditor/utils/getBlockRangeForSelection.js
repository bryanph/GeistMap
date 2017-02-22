
import { SelectionState } from 'draft-js';
import getRangesForDraftEntity from 'draft-js/lib/getRangesForDraftEntity';

export default (editorState) => {
    /*
     * get the corresponding selection state for
    */
    const selectionState = editorState.getSelection()
    const contentState = editorState.getCurrentContent()

    const startBlock = contentState
        .getBlockForKey(selectionState.getStartKey());

    const endBlock = contentState
        .getBlockForKey(selectionState.getEndKey());

    const blocks = contentState.getBlockMap()

    const startKey = selectionState.getStartKey()
    const endKey = selectionState.getEndKey()

    // const selectedBlocks = contentState.slice(start, end)
    let seenFirst = null
    let seenEnd = null
    selectedBlocks = blocks.filter((block, key, blockMap) => {
        if (key === startKey) {
            seenFirst = true;
            return true;
        }
        if (!seenFirst) return false;

        if (key !== endKey) {
            return true;
        }
        if (key === endKey) {
            seenLast = true;
            return true;
        }
        return false;
    })

    return selectedBlocks.every(block => (
        block.type() === 'unstyled'
    ))
};
