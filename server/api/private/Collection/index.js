
"use strict"

const _ = require('lodash')
const neo4j = require('@bryanph/neo4j-driver').v1

const config = require('../../../config/config')
const { print, printTrace } = require('../../../utils/dev')

const {
    updateIndex,
    removeCollectionDocument,
} = require('../../../fulltext')

const uuidV4 = require('uuid/v4');

// TODO: separate - 2017-08-23
function handleError(error) {
    if (error.stack) {
        console.error(error.stack)
    }
    else {
        console.error(error)
    }
}

module.exports = function(db, es) {
    /*
     * initialize with
     * db: Neo4j database instance
     * es: Elasticsearch database instance
     */

    return {
        // TODO: this method is not in API - 2017-06-04
        createRootCollection: async function(user) {

            const id = uuidV4();

            const results = await db.run(`
                MERGE (u:User {
                    id: {userId}
                })
                CREATE (c:Node:Collection:RootCollection {
                    id: {id},
                    name: {name},
                    isRootCollection: true,
                    type: "root",
                    created: timestamp(),
                    modified: timestamp()
                })<-[:AUTHOR]-(u)
                RETURN properties(c) as collection
                `,
                {
                    id,
                    userId: user._id.toString(),
                    name: "My Knowledge Base",
                }
            )

            const result = results.records[0]._fields[0]

            return result
        },

        getL1: function(user, id, res) {
            /*
             * Get abstraction with id ${id} including its children and their direct neighbours
             */
            const userId = user._id.toString()

            return Promise.all([
                // get all edges in the collection
                // TODO: should also filter out edges between parent collections and the nodes
                db.run(
                    `MATCH (u:User)--(c:Node)
                    WHERE u.id = {userId} AND c.id = {id}
                    MATCH (c)<-[:AbstractEdge*1..]-(n)-[e:EDGE]-(n2)
                    WITH DISTINCT n, c
                    MATCH (n)-[e:EDGE]-(n2)
                    WHERE c <> n2
                    RETURN distinct(properties(e)) as edge`,
                    {
                        id,
                        userId,
                    }
                ),
                // Get for every direct child, which abstractions they belong to
                // TODO: make sure nodes here doesn't include any parent collection
                /*
                 * Get every direct child
                 * Including their top-level abstractions in a list (ids)
                 */
                db.run(`
                    MATCH (u:User)--(c:Node)
                    WHERE u.id = {userId} AND c.id = {id}
                    MATCH (c)<-[:AbstractEdge*0..]-(n) // children of this collection
                    OPTIONAL MATCH (n)-[e:EDGE]-(n2) // get neighbours
                    WITH c + collect(distinct n) + collect(distinct n2) as nodelist
                    UNWIND nodelist as nodes
                    WITH DISTINCT nodes
                    OPTIONAL MATCH (nodes)-[:AbstractEdge]->(parentNodes)
                    WITH nodes, collect(parentNodes.id) as collections
                    OPTIONAL MATCH (nodes)<-[:AbstractEdge]-(children)
                    RETURN { id: nodes.id, name: nodes.name, type: nodes.type, modified: nodes.modified } as node, collections, COUNT(children)
                    ORDER BY node.id
                    `,
                    {
                        id,
                        userId,
                    }
                ),
            ])
                .then((results) => {
                    const edges = results[0].records.map(record => record.get('edge'))

                    let nodes = !results[1].records.length ?
                        [] :
                        results[1].records.map(row => (
                            Object.assign({},
                                row.get(0),
                                {
                                    collections: row.get(1), // ids for collections
                                    count: parseInt(row.get(2))
                                }
                            )
                        ))

                    const result = {
                        nodes,
                        edges // all edges between the nodes
                    }

                    if (res) {
                        return res(null, result)
                    }

                    return result
                })
                .catch(handleError)
        },

        remove: function(user, id, res) {
            /*
             * This converts the abstraction to a node and the edges to normal edges
             * instead it adds all the nodes to the parent collection
             */

            if (!id) {
                res("Must specify source id")
            }

            // TODO: should the abstract edges be returned to the user?
            // TODO: uuid created in the cypther here, how to sync this with the back-end

            return db.run(
                /*
                 * 1. Remove all nodes from the given abstraction
                 * 2. Attach them to the parent abstraction instead
                 * 3. Modify abstraction to be a node
                 */
                `
                MATCH (u:User)--(n:Collection)-[:AbstractEdge]->(pn:Collection)
                WHERE u.id = {userId} AND n.id = {id} AND NOT n:RootCollection
                SET n.type = 'node'
                REMOVE n:Collection
                WITH n, pn
                MATCH (n)<-[e:AbstractEdge]-(n2:Node)
                DELETE e
                MERGE (pn)<-[:AbstractEdge { id: apoc.create.uuid(), start: n2.id, end: pn.id }]-(n2)
                `,
                {
                    userId: user._id.toString(),
                    id,
                }
            )
                .then(results => {
                    if (res) {
                        return res(null, true) // success
                    }

                    return true
                })
                .catch(handleError)
        },

        addNode: function(user, collectionId, nodeId, id, res) {
            /*
             * Create the edge (collection)<-[:AbstractEdge]-(node)
             */

            if (!collectionId || !nodeId) {
                return res("Set both node ids")
            }

            // TODO: does this make sense?
            if (!id) {
                return res("id must be explicitly passed")
            }

            return db.run(`
                MATCH (u:User)--(c:Node), (u:User)--(n:Node)
                WHERE u.id = {userId}
                AND c.id = {collectionId} AND n.id = {nodeId}
                AND NOT (c)-[:AbstractEdge*0..]->(n)
                MERGE (n)-[e:AbstractEdge { id: {id}, start: n.id, end: c.id }]->(c)
                RETURN properties(e) as edge, properties(n) as node, properties(c) as collection
                `,
                {
                    id,
                    userId: user._id.toString(),
                    collectionId,
                    nodeId,
                }
            )
                .then(results => {
                    if (!results.records.length) {
                        if (res) {
                            res("Loop in path to root abstraction")
                        }

                        return "Loop in path to root abstraction"
                    }

                    const edge = results.records[0]._fields[0]
                    const node = results.records[0]._fields[1]
                    const collection = results.records[0]._fields[2]

                    if (res) {
                        res(null, edge)
                    }

                    return edge
                })
                .catch(handleError)
        },

        removeNode: function(user, collectionId, nodeId, res) {
            /*
             * Remove node with id #{id} from collection
             */

            if (!collectionId || !nodeId) {
                return res("Set both node ids")
            }

            return db.run(`
                MATCH (u:User)--(c:Node)<-[e:AbstractEdge]-(n:Node)--(u:User)
                WHERE u.id = {userId}
                AND c.id = {collectionId} AND n.id = {nodeId}
                DELETE e
                `,
                {
                    userId: user._id.toString(),
                    collectionId,
                    nodeId,
                }
            )
                .then(results => {
                    if (res) {
                        res(null, true)
                    }

                    return true
                })
                .catch(handleError)
        },

        moveNode: function(user, sourceCollectionId, sourceId, targetId, edgeId, res) {
            /*
             * move the source to be in the target abstraction
             *
             * must make sure there can be no duplicates in path to root (no loops)
             * in practice, only moved to parent or to child so not an issue
             */

            // first check if the action is legal
            return db.run(
                `
                    MATCH (u:User)--(n:Node)
                    WHERE u.id = {userId} AND n.id = {targetId}
                    MATCH (n)-[e:AbstractEdge*0..]->(c)
                    RETURN collect(distinct c.id)
                `,
                {
                    targetId,
                    userId: user._id.toString(),
                }
            ).then(results => {
                const parentIds = results.records[0].get(0)

                if (parentIds.includes(sourceId)) {
                    if (res) {
                        res("recursive pattern detected")
                    }

                    return "recursive pattern detected"
                }

                return Promise.all([
                    // remove the AbstractEdge to the source abstraction
                    db.run(
                        `
                    MATCH (u:User)--(n:Node), (u:User)--(c:Node)
                    WHERE u.id = {userId} AND n.id = {sourceId} AND c.id = {sourceCollectionId}
                    MATCH (n)-[e:AbstractEdge]->(c)
                    DELETE e
                    `,
                        {
                            userId: user._id.toString(),
                            sourceId,
                            sourceCollectionId,
                        }
                    ),
                    db.run(
                        // move the node to the abstraction with targetId
                        `
                    MATCH (u:User)--(n:Node), (u:User)--(c:Node)
                    WHERE u.id = {userId} AND n.id = {sourceId} AND c.id = {targetId}
                    CREATE (n)-[e:AbstractEdge { id: {edgeId}, start: {sourceId}, end: {targetId} }]->(c)
                    RETURN properties(e)
                    `,
                        {
                            userId: user._id.toString(),
                            sourceId,
                            targetId,
                            edgeId,
                        }
                    )

                ])
                    .then(results => {
                        const result = results[1].records[0]._fields[0]

                        if (res) {
                            res(null, result)
                        }

                        return result
                    })
                    .catch(handleError)

            })

        },

    }
}
