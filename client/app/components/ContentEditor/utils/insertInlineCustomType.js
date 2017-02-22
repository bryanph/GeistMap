
import { List, Repeat } from 'immutable';
import { Modifier, CharacterMetadata, BlockMapBuilder, EditorState, ContentBlock, Entity, genKey } from 'draft-js';

export default function(
    editorState: EditorState,
    entityKey: string,
    customType: string, // a custom type instead of "atomic" for the entity
): EditorState {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    // const firstBlank = Modifier.insertText(
    //         contentState,
    //         selectionState,
    //         " ",
    //         null,
    //         null
    //         );

    // const withEntity = Modifier.insertText(
    //         firstBlank,
    //         selectionState,
    //         " ",
    //         null,
    //         entityKey
    //         );

    // const withBlank = Modifier.insertText(
    //         withEntity,
    //         selectionState,
    //         " ",
    //         null,
    //         null,
    //         );

    const textWithEntity = Modifier.replaceText(contentState, selectionState, " ", null, entityKey)

    return EditorState.push(
        editorState,
        textWithEntity,
        `insert-${customType}`,
    )
}
