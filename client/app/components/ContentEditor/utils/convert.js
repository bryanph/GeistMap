import encodeEntityRanges from 'draft-js/lib/encodeEntityRanges'
import encodeInlineStyleRanges from 'draft-js/lib/encodeInlineStyleRanges'
import DraftStringKey from 'draft-js/lib/DraftStringKey'
import { ContentBlock } from 'draft-js'

import { OrderedMap, Map } from 'immutable'

import generateRandomKey from 'draft-js/lib/generateRandomKey'
import decodeInlineStyleRanges from 'draft-js/lib/decodeInlineStyleRanges'
import decodeEntityRanges from 'draft-js/lib/decodeEntityRanges'
import createCharacterList from 'draft-js/lib/createCharacterList'
// import addEntityToEntityMap from 'draft-js/lib/addEntityToEntityMap'
import DraftEntityInstance from 'draft-js/lib/DraftEntityInstance'



export function convertBlocksToRaw(
    contentState,
    blockMap: OrderedMap,
) {
  var entityStorageKey = 0;
  var entityStorageMap = {};
  var rawBlocks = [];

  blockMap.forEach((block, blockKey) => {
    block.findEntityRanges(
      character => character.getEntity() !== null,
      start => {
        // Stringify to maintain order of otherwise numeric keys.
        var stringifiedEntityKey = DraftStringKey.stringify(
          block.getEntityAt(start)
        );
        if (!entityStorageMap.hasOwnProperty(stringifiedEntityKey)) {
          entityStorageMap[stringifiedEntityKey] = '' + (entityStorageKey++);
        }
      }
    );

    rawBlocks.push({
      key: blockKey,
      text: block.getText(),
      type: block.getType(),
      depth: block.getDepth(),
      inlineStyleRanges: encodeInlineStyleRanges(block),
      entityRanges: encodeEntityRanges(block, entityStorageMap),
      data: block.getData().toObject(),
    });
  });

  // Flip storage map so that our storage keys map to global
  // DraftEntity keys.
  var entityKeys = Object.keys(entityStorageMap);
  var flippedStorageMap = {};
  entityKeys.forEach((key, jj) => {
    var entity = contentState.getEntity(DraftStringKey.unstringify(key));
    flippedStorageMap[jj] = {
      type: entity.getType(),
      mutability: entity.getMutability(),
      data: entity.getData(),
    };
  });

  return {
    entityMap: flippedStorageMap,
    blocks: rawBlocks,
  };
}


export function convertRawToBlocks(
  rawState,
): OrderedMap {
  var {blocks, entityMap} = rawState;

  var fromStorageToLocal = {};

  let entityKeyCount = 0

  const newEntityMap = Object.keys(entityMap).reduce(
    (updatedEntityMap, storageKey) => {
      var encodedEntity = entityMap[storageKey];
      var {type, mutability, data} = encodedEntity;
      const instance = new DraftEntityInstance({type, mutability, data: data || {}});
      // const tempEntityMap = addEntityToEntityMap(updatedEntityMap, instance);
      const tempEntityMap = updatedEntityMap.set(`${entityKeyCount++}`, instance)
      const newKey = tempEntityMap.keySeq().last();
      fromStorageToLocal[storageKey] = newKey;
      return tempEntityMap;
    },
    new OrderedMap()
  );

  var contentBlocks = blocks.map(
    block => {
      var {
        key,
        type,
        text,
        depth,
        inlineStyleRanges,
        entityRanges,
        data,
      } = block;
      key = key || generateRandomKey();
      depth = depth || 0;
      inlineStyleRanges = inlineStyleRanges || [];
      entityRanges = entityRanges || [];
      data = new Map(data);

      var inlineStyles = decodeInlineStyleRanges(text, inlineStyleRanges);

      // Translate entity range keys to the DraftEntity map.
      var filteredEntityRanges = entityRanges
        .filter(range => fromStorageToLocal.hasOwnProperty(range.key))
        .map(range => {
          return {...range, key: fromStorageToLocal[range.key]};
        });

      var entities = decodeEntityRanges(text, filteredEntityRanges);
      var characterList = createCharacterList(inlineStyles, entities);

      return new ContentBlock({key, type, text, depth, characterList, data});
    }
  );

  return contentBlocks
}
