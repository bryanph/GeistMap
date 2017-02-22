import { Entity } from 'draft-js';

function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return entityKey !== null && Entity.get(entityKey).getType() === 'CONTENT_LINK';
    }, callback
  );
}

export default findLinkEntities;
