
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
                /*
                 * get direct children
                 * Get every direct child
                 * Including their top-level abstractions in a list (ids)
                 * get all nodes below the abstraction and their direct neighbours, and also fetch all THEIR parents
                 * // TODO: Don't fetch the parents of all nodes - 2018-03-16
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
                    OPTIONAL MATCH (nodes)<-[:CHILD_LIST]-(:CHILD_LIST_NODE)<-[:CHILD_ORDER*1..]-(children:Node)
                    RETURN { 
                            id: nodes.id,
                            name: nodes.name,
                            type: nodes.type,
                            modified: nodes.modified
                        } as node,
                        collections,
                        collect(children.id) as children,
                        COUNT(children)
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
                                    collections: row.get(1), // ids for parents
                                    children: row.get(2), // ids for children
                                    count: parseInt(row.get(3))
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

        addNode: function(user, collectionId, nodeId, prevNodeId, newEdgeId, res) {
            /*
             * Create the edge (collection)<-[:AbstractEdge]-(node)
             * add (prevNodeId)<-[:CHILD_ORDER]-(node)
             * and (collection)<-[:CHILD_ORDER*..]
             */

            if (!collectionId || !nodeId || !prevNodeId) {
                return res("Set both node ids")
            }

            if (!newEdgeId) {
                return res("id must be explicitly passed")
            }

            return db.run(`
                MATCH (u:User)--(c:Node), (u:User)--(n:Node)
                WHERE u.id = {userId}
                AND c.id = {collectionId} AND n.id = {nodeId}
                AND NOT (c)-[:AbstractEdge*0..]->(n) // this checks for loops

                WITH c, n


                MATCH (c)<-[:CHILD_LIST]-(:CHILD_LIST_NODE)<-[:CHILD_ORDER*0..]-(prevNode)
                WHERE prevNode.id = { prevNodeId }
                OPTIONAL MATCH (prevNode)<-[prevEdge:CHILD_ORDER]-(nextNode:Node)

                CREATE (c)<-[e:AbstractEdge { id: {newEdgeId}, start: n.id, end: c.id }]-(n)
                CREATE (prevNode)<-[:CHILD_ORDER]-(n)

                // remove the next edge
                WITH n, prevNode, nextNode
                MATCH (prevNode)<-[prevEdge:CHILD_ORDER]-(nextNode)
                WHERE nextNode IS NOT NULL
                DELETE prevEdge
                CREATE (n)<-[:CHILD_ORDER]-(nextNode)


                `,
                {
                    userId: user._id.toString(),
                    collectionId,
                    nodeId,
                    prevNodeId,
                    newEdgeId,
                }
            )
                .then(results => {

                    // TODO: will have to split the query to be able to return custom errors - 2018-03-16
                    // if (!results.records.length) {
                    //     todo
                    //     if (res) {
                    //         res("Loop in path to root abstraction")
                    //     }

                    //     return "Loop in path to root abstraction"
                    // }

                    if (res) {
                        res(null, true)
                    }

                    return true
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
