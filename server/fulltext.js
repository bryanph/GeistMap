
const nodeIndex = 'nodes'
const collectionIndex = 'collections'

// TODO: also index on collections - 2016-07-11
// TODO: also index on draftjs text - 2016-07-11
export function updateIndex(es, user, node) {
    return es.index({
        index: 'nodes',
        type: 'node',
        id: node.id,
        body: {
            user: user._id.toString(),
            title: node.properties.name,
            content: node.properties.editorPlainText,
            // collections: node.collections
        }
    })
    .then(res => console.log(res))
    .catch(error => console.error(error))
}

export function removeNodeDocument(es, id) {
    return es.delete({
        index: 'nodes',
        type: 'node',
        id: id,
    })
    .then(res => console.log(res))
    .catch(error => console.error(error))
}

export function updateCollectionIndex(es, user, collection) {
    return es.index({
        index: 'collections',
        type: 'collection',
        id: collection.id,
        body: {
            user: user._id.toString(),
            title: collection.properties.name,
            description: collection.properties.description,
            // TODO: index node content for collection index? (with smaller weight) - 2016-07-26
            // collections: collection.collections
        }
    })
    .then(res => console.log(res))
    .catch(error => console.error(error))
}

export function removeCollectionDocument(es, id) {
    return es.delete({
        index: 'collections',
        type: 'collection',
        id: id,
    })
    .then(res => console.log(res))
    .catch(error => console.error(error))
}

