import React, { PropTypes } from 'react';
import { Entity, RichUtils } from 'draft-js';

import { getSelectionEntity } from 'draftjs-utils'

export function insertLink(editorState) {
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
        return;
    }

    const active = isActive(editorState)
    
    if (active) {
        return RichUtils.toggleLink(editorState, selection, null)
    } else {
        // TODO: use a DOM element instead - 2016-06-28
        const href = window.prompt('Enter a URL'); // eslint-disable-line no-alert

        if (!href) return;

        const entityKey = Entity.create('LINK', 'MUTABLE', { href });

        return RichUtils.toggleLink(editorState, selection, entityKey)
    }
}

export function isActive(editorState) {

    const selection = editorState.getSelection();
    const startBlock = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey());

    const called = false

    // console.log(getSelectionEntity(editorState))

    // TODO: write a helper method for this - 2016-09-23
    return getSelectionEntity(editorState)
}

