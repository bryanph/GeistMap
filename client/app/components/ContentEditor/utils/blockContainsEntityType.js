
import { Entity, } from 'draft-js';
import getRangesForDraftEntity from 'draft-js/lib/getRangesForDraftEntity';

export default (block, type) => {
    /*
     *  check if block contains an entity with type
    */

    return block.getCharacterList().some(charMetaData => {
        const entityKey = charMetaData.getEntity()
        return entityKey && Entity.get(entityKey).type === type
    })
};
