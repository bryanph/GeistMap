import { List, Map, Repeat } from 'immutable';
import { Modifier, CharacterMetadata, BlockMapBuilder, EditorState, ContentBlock, Entity, genKey } from 'draft-js';

export default function(
    editorState: EditorState,
    entityKey: string,
    character: string,
    customType: string, // a custom type instead of "atomic" for the entity
): EditorState {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const afterRemoval = Modifier.removeRange(
        contentState,
        selectionState,
        'backward'
    );

    const targetSelection = afterRemoval.getSelectionAfter();
    const afterSplit = Modifier.splitBlock(afterRemoval, targetSelection); // ContentState
    const insertionTarget = afterSplit.getSelectionAfter();

    // TODO: what is this? - 2016-08-03
    const asAtomicBlock = Modifier.setBlockType(
        afterSplit,
        insertionTarget,
        'atomic',
    );

    const charData = CharacterMetadata.create({entity: entityKey});

    const fragmentArray = [
        new ContentBlock({
            key: genKey(),
            // type: 'atomic',
            data: Map({
                type: customType,
            }),
            type: 'atomic',
            text: character,
            characterList: List(Repeat(charData, character.length || 1)),
        }),
        new ContentBlock({
                key: genKey(),
                type: 'unstyled',
                text: '',
                characterList: List(),
            }),
    ];

    const fragment = BlockMapBuilder.createFromArray(fragmentArray);

    const withAtomicBlock = Modifier.replaceWithFragment(
        asAtomicBlock,
        insertionTarget,
        fragment
    );

    const newContent = withAtomicBlock.merge({
        selectionBefore: selectionState,
        selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', true),
    });

    return EditorState.push(editorState, newContent, `insert-fragment`);
}
