import React from 'react';

import { RichUtils } from 'draft-js'
import BlockControls from './BlockControls';

const blockTypesNoNewLine = ['header-one', 'header-two', 'header-three', 'header-four', 'header-five', 'header-six', 'blockquote']

import { List, Repeat } from 'immutable';
import { Modifier, KeyBindingUtil, CharacterMetadata, BlockMapBuilder, EditorState, ContentBlock, Entity, genKey } from 'draft-js';

/**
 * Function will change block style to unstyled for selected blocks.
 * RichUtils.tryToRemoveBlockStyle does not workd for blocks of length greater than 1.
 */
export function removeSelectedBlocksStyle(editorState) {
    const newContentState = RichUtils.tryToRemoveBlockStyle(editorState);
    return EditorState.push(editorState, newContentState, 'change-block-type');
}


function keyBindingFn(e) {
    if (e.keyCode === 49 && KeyBindingUtil.isCtrlKeyCommand(e)) { // ctrl-1
        return 'insert-header-three'
    }
    if (e.keyCode === 50 && KeyBindingUtil.isCtrlKeyCommand(e)) { // ctrl-2
        return 'insert-header-four'
    }
    if (e.keyCode === 51 && KeyBindingUtil.isCtrlKeyCommand(e)) { // ctrl-3
        return 'insert-header-five'
    }
    if (e.keyCode === 54 && KeyBindingUtil.isCtrlKeyCommand(e)) { // ctrl-5
        return 'insert-blockquote'
    }
    if (e.keyCode === 55 && KeyBindingUtil.isCtrlKeyCommand(e)) { // ctrl-:
        return 'insert-code'
    }

    return null
}

export default (config = {}) => {
    function handleKeyCommand(command, editorState, { setEditorState }) {

        if (command === 'insert-header-three') {
            const nextState = RichUtils.toggleBlockType(
                editorState,
                'header-three',
            );

            setEditorState(
                EditorState.forceSelection(
                    nextState, nextState.getCurrentContent().getSelectionAfter()
                )
            );
        }
        if (command === 'insert-header-four') {
            const nextState = RichUtils.toggleBlockType(
                editorState,
                'header-four',
            );

            setEditorState(
                EditorState.forceSelection(
                    nextState, nextState.getCurrentContent().getSelectionAfter()
                )
            );
        }
        if (command === 'insert-header-five') {
            const nextState = RichUtils.toggleBlockType(
                editorState,
                'header-five',
            );

            setEditorState(
                EditorState.forceSelection(
                    nextState, nextState.getCurrentContent().getSelectionAfter()
                )
            );
        }
        if (command === 'insert-blockquote') {
            const nextState = RichUtils.toggleBlockType(
                editorState,
                'blockquote',
            );

            setEditorState(
                EditorState.forceSelection(
                    nextState, nextState.getCurrentContent().getSelectionAfter()
                )
            );
        }
        if (command === 'insert-code') {
            const nextState = RichUtils.toggleBlockType(
                editorState,
                'code-block',
            );

            setEditorState(
                EditorState.forceSelection(
                    nextState, nextState.getCurrentContent().getSelectionAfter()
                )
            );
        }


        if (command === 'split-block') {
            const selectionState = editorState.getSelection();
            const contentState = editorState .getCurrentContent()

            const currentBlock = contentState.getBlockForKey(selectionState.getStartKey())
            const blockType = currentBlock.getType();

            if (selectionState.isCollapsed() && blockTypesNoNewLine.includes(blockType)) { 
                // remove the blocktype
                // const afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);

                const afterRemoval = Modifier.removeRange(
                    contentState,
                    selectionState,
                    'backward'
                );

                const targetSelection = afterRemoval.getSelectionAfter();
                const afterSplit = Modifier.splitBlock(afterRemoval, targetSelection); // ContentState
                const insertionTarget = afterSplit.getSelectionAfter();

                const fragmentArray = [
                    new ContentBlock({
                        key: genKey(),
                        type: 'unstyled',
                        text: '',
                        characterList: List(),
                    }),
                ];

                const fragment = BlockMapBuilder.createFromArray(fragmentArray);

                const withAtomicBlock = Modifier.replaceWithFragment(
                    afterSplit,
                    insertionTarget,
                    fragment
                );

                const newContent = withAtomicBlock.merge({
                    selectionBefore: selectionState,
                    selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', true),
                });

                const newEditorState = EditorState.push(editorState, newContent, `newline`);

                // const newState = removeSelectedBlocksStyle(editorState)
                const newState = RichUtils.toggleBlockType(
                    newEditorState,
                    blockType,
                );

                if (newState) {
                    setEditorState(newState)
                    return 'handled'
                }
            }
        }

        return 'not-handled'
    }

    return {
        handleKeyCommand,
        keyBindingFn,
    }
}

const blockStyles = {
    h1: { label: 'H1', button: <span>h1</span>, style: 'header-one' },
    h2: { label: 'H2', button: <span>h2</span>, style: 'header-two' },
    h3: { label: 'H3', button: <span>h3</span>, style: 'header-three' },
    h4: { label: 'H4', button: <span>h4</span>, style: 'header-four' },
    h5: { label: 'H5', button: <span>h5</span>, style: 'header-five' },
    h6: { label: 'H6', button: <span>h6</span>, style: 'header-six' },
    blockquote: { label: 'Blockquote', button: <i>"</i>, style: 'blockquote' },
    ul: { label: 'Ul', button: <span>UL</span>, style: 'unordered-list-item' },
    ol: { label: 'Ol', button: <span>OL</span>, style: 'ordered-list-item' },
    codeblock: { label: 'Codeblock', button: <span>#</span>, style: 'code-block' },
}

export const H1Button = BlockControls(blockStyles['h1'])
export const H2Button = BlockControls(blockStyles['h2'])
export const H3Button = BlockControls(blockStyles['h3'])
export const H4Button = BlockControls(blockStyles['h4'])
export const H5Button = BlockControls(blockStyles['h5'])
export const H6Button = BlockControls(blockStyles['h6'])
export const BlockquoteButton = BlockControls(blockStyles['blockquote'])
export const UlButton = BlockControls(blockStyles['ul'])
export const OlButton = BlockControls(blockStyles['ol'])
export const CodeblockButton = BlockControls(blockStyles['codeblock'])
