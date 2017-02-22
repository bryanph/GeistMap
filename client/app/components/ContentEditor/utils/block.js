import {
    EditorState,
    RichUtils,
    Modifier,
    CharacterMetadata,
    BlockMapBuilder,
    ContentBlock,
    Entity,
    genKey,
} from 'draft-js';

import {
    Map,
    OrderedMap,
    List,
} from 'immutable';

/**
 * Function returns collection of currently selected blocks.
 */
export function getSelectedBlocksMap(editorState: EditorState): OrderedMap {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey();
    const blockMap = contentState.getBlockMap();
    return blockMap
        .toSeq()
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat([[endKey, blockMap.get(endKey)]]);
}

/**
 * Function returns collection of currently selected blocks.
 */
export function getSelectedBlocksList(editorState: EditorState): List {
    return getSelectedBlocksMap(editorState).toList();
}

/**
 * Function returns the first selected block.
 */
export function getSelectedBlock(editorState: EditorState): ContentBlock {
    if (editorState) {
        return getSelectedBlocksList(editorState).get(0);
    }
    return undefined;
}

export function insertDataBlock(editorState, data) {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const afterRemoval = Modifier.removeRange(
        contentState,
        selectionState,
        "backward"
    );

    const targetSelection = afterRemoval.getSelectionAfter();
    const afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);
    const insertionTarget = afterSplit.getSelectionAfter();

    const asAtomicBlock = Modifier.setBlockType(
        afterSplit,
        insertionTarget,
        "atomic"
    );

    const block = new ContentBlock({
        key: genKey(),
        type: "atomic",
        text: "",
        characterList: List(),
        data: new Map(data)
    });


    const fragmentArray = [
        block,
        new ContentBlock({
            key: genKey(),
            type: "unstyled",
            text: "",
            characterList: List()
        })
    ];

    const fragment = BlockMapBuilder.createFromArray(fragmentArray);

    const withAtomicBlock = Modifier.replaceWithFragment(
        asAtomicBlock,
        insertionTarget,
        fragment
    );

    const newContent = withAtomicBlock.merge({
        selectionBefore: selectionState,
        selectionAfter: withAtomicBlock.getSelectionAfter().set("hasFocus", true)
    });

    return EditorState.push(editorState, newContent, "insert-fragment");
}

