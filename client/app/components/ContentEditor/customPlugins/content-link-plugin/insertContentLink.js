import React from 'react';
import { Entity, RichUtils } from 'draft-js';

import { getSelectionEntity } from '../../utils/inline.js'

export function insertContentLink(editorState, { nodeId, showAddRelationWindow, removeEdge }) {
    /*
     * Insert or remove content link based on selection
    */
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
        return;
    }

    const active = isActive(editorState)

    if (active) {
        // const { nodeId, edgeId } = Entity.get(firstEntityKey).getData()

        // this.props.removeEdge(edgeId)
        return RichUtils.toggleLink(editorState, selection, null)
    } else {

        showAddRelationWindow(nodeId, editorState)

        return editorState
    }
}

export function isActive(editorState) {

    const selection = editorState.getSelection();
    const startBlock = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey());

    const called = false

    // TODO: write a helper method for this - 2016-09-23
    return getSelectionEntity(editorState)
}

