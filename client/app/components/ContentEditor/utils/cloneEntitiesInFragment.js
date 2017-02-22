import { Entity, BlockMapBuilder } from 'draft-js'
import applyEntityToContentBlock from './applyEntityToContentBlock'

export default function cloneEntitiesInFragment(fragment, customEntityMap) {

    // Get all entities referenced in the fragment
    const entities = {};

    fragment.forEach(block => {
        block.getCharacterList().forEach(character => {
            const key = character.getEntity();
            if (key !== null) {
                // console.log(key);
                // entities[key] = Entity.get(key);
                entities[key] = customEntityMap ? customEntityMap[key] : Entity.get(key);
            }
        });
    });

    // Clone each entity that was referenced and
    // build a map from old entityKeys to new ones
    const newEntityKeys = {};

    Object.keys(entities).forEach((key) => {
        const entity = entities[key];
        const newEntityKey = Entity.create(
            customEntityMap ? entity['type'] : entity.get('type'),
            customEntityMap ? entity['mutability'] : entity.get('mutability'),
            customEntityMap ? entity['data'] : entity.get('data')
        );
        newEntityKeys[key] = newEntityKey;
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

    return newFragment;
}



export function cloneLatexEntitiesInFragment(fragment, html) {

    // create an entity for every data-entityData seen in the html
    const entities = {};

    fragment.forEach(block => {
        const chars = block.getCharacterList()

        block.getCharacterList().forEach(character => {
            const key = character.getEntity();
            if (key !== null) {
                entities[key] = Entity.get(key);
            }
        });
    });

    // Clone each entity that was referenced and
    // build a map from old entityKeys to new ones
    const newEntityKeys = {};

    Object.keys(entities).forEach((key) => {
        const entity = entities[key];
        const newEntityKey = Entity.create(
            entity.get('type'),
            entity.get('mutability'),
            entity.get('data')
        );
        newEntityKeys[key] = newEntityKey;
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

    return newFragment;
}
