
import { Entity, DraftModifier } from 'draft-js'
import applyEntityToContentBlock from './applyEntityToContentBlock'

export default (editorState, targetSelection, entityKey, entityTypes=[]) => {
    /*
     * toggleLink, but ignore ${ignoredEntityTypes} (can be included in link)
    */

    // iterate over all characters in selection, check if they are unstyled, then add 'LINK' entity key, else 

    startBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            const entityIsLink = entityKey !== null && entityTypes.includes(Entity.get(entityKey).getType());

            this.setState({ active: entityIsLink })
        },

        (start, end) => {
            if (block.getKey() === selection.anchorKey && selection.anchorKey === selection.focusKey) {
                if (selection.anchorOffset >= start && selection.focusOffset <= end) {
                    this.setState({ active: true })
                }
            }
        }
    );

    var withoutLink = DraftModifier.applyEntity(
      editorState.getCurrentContent(),
      targetSelection,
      entityKey
    );

    return EditorState.push(
      editorState,
      withoutLink,
      'apply-entity'
    );

}
