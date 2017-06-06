const config = require('./config/config')

const nodeIndex = config.es.nodeIndex
const collectionIndex = config.es.collectionIndex

const nodeMappingType = config.es.nodeMappingType
const collectionMappingType = config.es.collectionMappingType

exports.updateIndex = function updateIndex(es, userid, node) {
    return es.index({
        index: nodeIndex,
        type: nodeMappingType,
        id: node.id,
        body: {
            user: userid,
            title: node.name,
            content: node.editorPlainText,
            // collections: node.collections
        }
    })
    .then(res => console.log(res))
    .catch(error => console.error(error))
}

exports.removeNodeDocument = function removeNodeDocument(es, id) {
    return es.delete({
        index: nodeIndex,
        type: nodeMappingType,
        id: id,
    })
    .then(res => console.log(res))
    .catch(error => console.error(error))
}

exports.updateCollectionIndex = function updateCollectionIndex(es, user, collection) {
    return es.index({
        index: collectionIndex,
        type: collectionMappingType,
        id: collection.id,
        body: {
            user: user._id.toString(),
            title: collection.name,
            description: collection.description,
            // TODO: index node content for collection index? (with smaller weight) - 2016-07-26
            // collections: collection.collections
        }
    })
    .then(res => console.log(res))
    .catch(error => console.error(error))
}

exports.removeCollectionDocument = function removeCollectionDocument(es, id) {
    return es.delete({
        index: collectionIndex,
        type: collectionMappingType,
        id: id,
    })
    .then(res => console.log(res))
    .catch(error => console.error(error))
}

