import { Entity, BlockMapBuilder } from 'draft-js'
import applyEntityToContentBlock from './applyEntityToContentBlock'

export default function cloneEntitiesInFragment(editorState, fragment, customEntityMap) {

    const contentState = editorState.getCurrentContent()

    // Get all entities referenced in the fragment
    const entities = {};

    fragment.forEach(block => {
        block.getCharacterList().forEach(character => {
            const key = character.getEntity();
            if (key !== null) {
                entities[key] = customEntityMap ? customEntityMap[key] : contentState.getEntity(key);
            }
        });
    });

    let newContentState = contentState;

    // Clone each entity that was referenced and
    // build a map from old entityKeys to new ones
    const newEntityKeys = {};

    Object.keys(entities).forEach((key) => {
        const entity = entities[key];
        newContentState = newContentState.createEntity(
            customEntityMap ? entity['type'] : entity.get('type'),
            customEntityMap ? entity['mutability'] : entity.get('mutability'),
            customEntityMap ? entity['data'] : entity.get('data')
        );

        newEntityKeys[key] = newContentState.getLastCreatedEntityKey();
    });

    // Update all the entity references
    let newFragment = BlockMapBuilder.createFromArray([]);
    fragment.forEach((block, blockKey) => {
        let updatedBlock = block;
        newFragment = newFragment.set(blockKey, updatedBlock);
        block.findEntityRanges(
            character => character.getEntity() !== null,
            (start, end) => {
                const entityKey = block.getEntityAt(start);
                const newEntityKey = newEntityKeys[entityKey];
                updatedBlock = applyEntityToContentBlock(updatedBlock, start, end, newEntityKey);
                newFragment = newFragment.set(blockKey, updatedBlock);
            }
        );
    });

    return {
        newFragment,
        newContentState,
    }
}

