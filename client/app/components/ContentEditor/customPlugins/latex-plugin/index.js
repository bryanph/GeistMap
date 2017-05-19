import React, { PropTypes } from 'react';
import _ from 'lodash'

import { EditorState, RichUtils, Entity, KeyBindingUtil, AtomicBlockUtils, SelectionState, Modifier, BlockMapBuilder, ContentBlock } from 'draft-js'
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor'
import getFragmentFromSelection from 'draft-js/lib/getFragmentFromSelection'

import {OrderedMap, Map, fromJS} from 'immutable';

import TeXBlock from './TeXBlock';
import {insertTeXBlock} from './modifiers/insertTeXBlock';
import {removeTeXBlock} from './modifiers/removeTeXBlock';

import cloneEntitiesInFragment, { cloneLatexEntitiesInFragment } from '../../../../components/ContentEditor/utils/cloneEntitiesInFragment.js'
import insertFragment from '../../../../components/ContentEditor/utils/insertFragment'
import { convertBlocksToRaw, convertRawToBlocks } from '../../../../components/ContentEditor/utils/convert.js'

import styles from './styles.css'

// import './katex.min.css'


function findTex(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const key = character.getEntity()
      return key !== null && Entity.get(key).getType() === 'inline-latex'
    },
    callback
  )
}

function texKeyBindingFn(e) {
    if (e.keyCode === 77 && KeyBindingUtil.isCtrlKeyCommand(e)) { // ctrl-m
        if (e.shiftKey) {
            return 'tex'
        }
        return 'inline-tex'
    }

    // if (e.keyCode === 67 /* `C` key */ && KeyBindingUtil.hasCommandModifier(e)) {
    //     return 'copy'
    // }

    return null
}

function texHandleKeyCommand(
    command: string,
    editorState: EditorState,
    { setEditorState }
): DraftHandleValue {
    if (command === 'tex') {
        setEditorState(insertTeXBlock(editorState), true)
        return 'handled'
    } else if (command === 'inline-tex') {
        setEditorState(insertTeXBlock(editorState, true), true)
        return 'handled'
    }
    // } else if (command === 'copy') {
    //     const editorState = editorState
    //     const selection = editorState.getSelection()
    //     const contentState = editorState.getCurrentContent()

    //     if (selection.isCollapsed()) {
    //         return 'not-handled'
    //     }

    //     const fragments = getFragmentFromSelection(editorState)

    //     const rawBlocks = convertBlocksToRaw(contentState, fragments)


    //     window.localStorage.setItem('draftjs-copyState', JSON.stringify(rawBlocks))

    //     // return 'handled'
    //     return 
    // }
    

    return 'not-handled'
}

export default (config = {}) => {
    return ({ getEditorState, setEditorState, setReadOnly, getClipboard, setClipboard, focus, getBlockRenderMap, getEditorKey }) => {

        // must be here because otherwise normal copy gets preventDefaulted..
        document.addEventListener('keydown', function(event) {
            if (event.ctrlKey && (event.which === 67 ||  event.which === 88)) {
                // open help widget
                const editorState = getEditorState()
                const selection = editorState.getSelection()
                const contentState = editorState.getCurrentContent()

                if (selection.isCollapsed()) {
                    return true
                }

                const fragments = getFragmentFromSelection(editorState)
                let rawBlocks = convertBlocksToRaw(contentState, fragments)
                rawBlocks.editorKey = getEditorKey()

                window.localStorage.setItem('draftjs-copyState', JSON.stringify(rawBlocks))
                
                // set clipboard to null, must happen after draft sets it - 2016-11-16
                setTimeout(() => setClipboard(null), 0)

                return true
            }
        });

        // const type = config.type || 'block-image';
        // const theme = config.theme ? config.theme : styles;

        const _removeTeX = (key, inline) => {
            const editorState = getEditorState()
            if (inline) {
                // key is an Entity key here

                // Modifier.removeRange(
                //     editorState.getContentState(),
                //     ,
                //     'forward',
                // )
                // find entities with the appropriate key and remove them
                Modifier.applyEntity(editorState.getCurrentContent())
            } else {
                // key is a blockKey here
                setEditorState(removeTeXBlock(getEditorState(), key));
            }
        };

        const _insertTeX = () => {
            setEditorState(insertTeXBlock(getEditorState()));
        };

        const handlers = {
            onStartEdit: (key, isInline) => {
                // here key is blockKey for block, entityKey for inline
                setReadOnly(true)
            },
            onFinishEdit: (key, isInline) => {
                const editorState = getEditorState()

                // setEditorState(editorState, true)
                setReadOnly(false)

                if (isInline) {
                    const selectionState = editorState.getSelection()
                    const contentState = editorState.getCurrentContent()
                    const startKey = selectionState.getStartKey()
                    const startBlock = contentState.getBlockForKey(startKey)

                    const offset = selectionState.getStartOffset()

                    const newSelectionState = selectionState
                        .set('anchorKey', startKey)
                        .set('anchorOffset', offset)
                        .set('focusKey', startKey)
                        .set('focusOffset', offset)

                    const editorStateWithSelection = EditorState.forceSelection(editorState, newSelectionState)
                    setEditorState(editorStateWithSelection, true)

                    setTimeout(() => focus(), 0)

                    // now find entity range and create a new selection after this
                } else {
                    setEditorState(editorState, true)
                    setTimeout(() => focus(), 0)

                }
                // setEditorState({liveTeXEdits: liveTeXEdits.remove(blockKey)});
            },
            onRemove: (blockKey, isInline) => {
                _removeTeX(blockKey),
                setTimeout(() => focus(), 0)
                setReadOnly(false)
            },
            onUpdate: (editorState) => {
                // TODO: nescessary? - 2016-08-26
                // setEditorState(getEditorState(), true)
            },
        }

        return {
            // Handle 'block-image' block-type with Image imageComponent
            decorators: [{
                strategy: findTex,
                component: TeXBlock,
                props: {
                    ...handlers,
                    inline: true,
                }
            }],
            handlePastedText: (text, html, editorState) => {
                const internalClipboard = getClipboard()

                if (internalClipboard) {
                    // TODO: create a unique key to compare with instead - 2016-08-22
                    if (html.indexOf('TeXEditor') !== -1) {
                        const clipboard = cloneEntitiesInFragment(internalClipboard)
                        setEditorState(insertFragment(editorState, clipboard))
                        return true
                    }
                }

                // check if localstorage has fresh fragments
                // if so, go through all fragments and clone all the entities
                // TODO: this only works between tabs - 2016-11-16
                const rawBlocksString = window.localStorage.getItem('draftjs-copyState') 
                if (rawBlocksString && (!!html)) {
                    const rawBlocks = JSON.parse(rawBlocksString)

                    // test if this paste comes from the editor
                    // TODO: this is not enough - 2016-11-16
                    const regex = /data-editor="(.*?[^\\])"/
                    const match = regex.exec(html)
                    const regex2 = /TeXEditor-inline-tex/
                    const match2 = regex2.exec(html)

                    if (!(match && match[1] === rawBlocks.editorKey) && !match2) {
                        return
                    }
                    
                    const rawText = _(rawBlocks.blocks).reduce(
                        (text, value) => text + '\u000A' + value['text'], "")

                    const fragments = convertRawToBlocks(rawBlocks)

                    const newFragments = cloneEntitiesInFragment(fragments, rawBlocks.entityMap)
                    setEditorState(insertFragment(editorState, newFragments))
                    return true


                }

                // if (html.indexOf('TeXEditor') !== -1) {
                //     const clipboard = cloneEntitiesInFragment(internalClipboard)
                //     setEditorState(insertFragment(editorState, clipboard))
                //     return true
                // }

                // // If there is html paste data, try to parse that.
                // if (html) {
                //     var htmlFragment = DraftPasteProcessor.processHTML(
                //         html,
                //         getBlockRenderMap(),
                //     );
                //     if (htmlFragment) {
                //         if (html.indexOf('TeXEditor') !== -1) { // TODO: more unique identifier - 2016-11-13
                //             const clipboard = cloneLatexEntitiesInFragment(htmlFragment, html)
                //             setEditorState(insertFragment(editorState, clipboard))
                //             return true
                //         }


                //         // const { contentBlocks, entityMap } = htmlFragment;
                //         // if (contentBlocks) {
                //         //     var htmlMap = BlockMapBuilder.createFromArray(contentBlocks);
                //         //     setEditorState(
                //         //         // insertFragment(this._latestEditorState, htmlMap, entityMap)
                //         //         insertFragment(getEditorState(), htmlMap, entityMap)
                //         //     );
                //         //     return;
                //         // }
                //     }
                // }
            },
            blockRendererFn: (block) => {
                const data = block.getData()
                if (block.getType() === 'atomic' && data.get('type') === 'latex') {
                    return {
                        component: TeXBlock,
                        editable: false,
                        props: {
                            ...handlers,
                            inline: false,
                        }
                    };
                }
                // if (block.getType() === 'inline-latex') {
                //     return {
                //         component: TeXBlock,
                //         editable: false,
                //         props: {
                //             ...handlers,
                //             inline: true,
                //         }
                //     };
                // }
                return null;
            },
            onChange: (editorState) => {
                if(editorState.getLastChangeType()==='undo' || editorState.getLastChangeType()==='redo'){
                    return editorState
                }else{
                    const currentContent = editorState.getCurrentContent()
                    const blocks = currentContent.blockMap
                    const newEditorState = blocks.reduce(addEntityEolDelimiter, editorState)
                    return newEditorState
                }
            },
            keyBindingFn: texKeyBindingFn,
            handleKeyCommand: (command, editorState) => texHandleKeyCommand(command, editorState, { setEditorState }),
        };
    }
}

let addedEolHack = false;
const addEntityEolDelimiter = (editorState, block) => {
    /*
     * Pretty bad workaround for TeX EOL bug.
     * just inserts &#8203 after inline TeX when nescessary
     */
    // if (block.getType() === 'atomic' || block.getText() === '') {
    //     return editorState
    // }
    if (block.getType() === 'atomic') {
        return editorState
    }

    const blockKey = block.key
    const characterList = block.characterList
    if ((!characterList.isEmpty() && characterList.last().getEntity())) {
        if(editorState.getLastChangeType() === 'backspace-character' && addedEolHack) {
            const selection = new SelectionState({
                anchorKey: blockKey,
                anchorOffset: block.getLength() - 1,
                focusKey: blockKey,
                focusOffset: block.getLength(),
                hasFocus: true
            })
            const modifiedContent = Modifier.removeRange(editorState.getCurrentContent(), selection, 'backward')
            return EditorState.push(editorState, modifiedContent, editorState.getLastChangeType())
        } else {

            const selection = new SelectionState({
                anchorKey: blockKey,
                anchorOffset: block.getLength(),
                focusKey: blockKey,
                focusOffset: block.getLength(),
                hasFocus: true
            })

            addedEolHack = true
            const zwwsp = String.fromCharCode(8203)
            const modifiedContent = Modifier.insertText(editorState.getCurrentContent(), selection, zwwsp)
            return EditorState.push(editorState, modifiedContent, editorState.getLastChangeType())
        }
    } else {
        return editorState
    }
}

export { InsertTeXButton, InsertInlineTeXButton } from './components/InsertTeXButton'

