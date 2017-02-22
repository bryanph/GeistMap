import React from 'react';
import getSelection from '../utils/getSelection';
import getSelectionRect from '../utils/getSelectionRect';

// Helper function, is toolbar necessary / is a text selected?
export const shouldRenderToolbar = editorState => {
  const selected = getSelection();
  const selectionState = editorState ? editorState.getSelection() : null;
  return !!selected.rangeCount && !selectionState.isCollapsed();
};

// Helper function, is toolbar necessary / is a text selected?
export const getToolbarPosition = () => getSelectionRect(getSelection());

// Toggle the block type
/* function toggleBlockType(editorState, setEditorState, blockType) {
  setEditorState(RichUtils.toggleBlockType(
    editorState,
    blockType
  ));
} */

export const getToolbarComponents = (config, editorState, setEditorState) => {
    const selectionState = editorState.getSelection()

    const activeAction = config.actions.find(action => action.rule(editorState, selectionState))

    if (!activeAction) {
        return []
    }

    return activeAction.components.map(ActionComponent =>
        (props) => 
            <ActionComponent 
                editorState={editorState} 
                getEditorState={() => editorState} 
                setEditorState={setEditorState} 
                {...props} 
            />
    );
}
