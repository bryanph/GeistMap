
"use strict"

const _ = require('lodash')
const neo4j = require('neo4j-driver').v1

const config = require('../../../config/config')
const { print, printTrace } = require('../../../utils/dev')

const {
    updateCollectionIndex,
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
                CREATE (c:Collection:RootCollection {
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
        },

        getAll: function(user, res) {
            /*
             * Get all collections and their abstract relationships
             */

            // TODO: only get collections reachable from the root node - 2017-07-14
            Promise.all([
                // get all the edges between the collections
                db.run(`
                    MATCH (u:User)--(c:Collection)
                    WHERE u.id = {userId}
                    WITH collect(c) as c2
                    UNWIND c2 as cu1
                    UNWIND c2 as cu2
                    MATCH (cu1)-[e:AbstractEdge]->(cu2)
                    RETURN collect(properties(e))
                    `,
                    {
                        userId: user._id.toString()
                    }
                ),
                db.run(`
                    MATCH (u:User)--(c:Collection)
                    WHERE u.id = {userId}
                    OPTIONAL MATCH (c)<-[:AbstractEdge*0..5]-(c2:Collection)
                    OPTIONAL MATCH (c2)--(n:Node)
                    RETURN properties(c), count(n)
                    `,
                    {
                        userId: user._id.toString()
                    }
                )
            ]).then((results) => {
                const edges = results[0].records[0]._fields[0]
                const collections = results[1].records.map(row => (
                    Object.assign({},
                        row.get(0),
                        {
                            count: row.get(1).toNumber()
                        }
                    )
                ))

                return res(null, {
                    collections,
                    edges
                })
            })
                .catch(handleError)
        },

        get: function(user, id, res) {
            /*
             * Get abstraction with id ${id} and its children
             */

            const userId = user._id.toString()

            Promise.all([
                // get collection
                db.run(
                    `MATCH (u:User)--(c:Collection)
                    WHERE u.id = {userId} AND c.id = {id}
                    RETURN c;`,
                    {
                        id,
                        userId,
                    }
                ),
                // get all edges in the collection
                db.run(
                    `MATCH (u:User)--(c:Collection)
                    WHERE u.id = {userId} AND c.id = {id}
                    OPTIONAL MATCH (c)<-[*0..]-(:Collection)--(n:Node)
                    WITH c, collect(distinct n) as ns
                    UNWIND ns as n1
                    UNWIND ns as n2
                    OPTIONAL MATCH (n1)-[e:EDGE]-(n2)
                    RETURN collect(distinct e)`,
                    {
                        id,
                        userId,
                    }
                ),
                // get all nodes in the collection, along with THEIR collections (ids)
                db.run( `
                    MATCH (u:User)--(c:Collection)
                    WHERE u.id = {userId} AND c.id = {id}
                    OPTIONAL MATCH (c)<-[*0..]-(:Collection)--(n:Node)
                    WITH distinct n
                    OPTIONAL MATCH (n)-[:IN]-(c:Collection)-[:PARENT*0..]->(c2:Collection) // get collections for node
                    RETURN n, collect(distinct c2.id)
                    ORDER BY n.id
                    `,
                    {
                        id,
                        userId,
                    }
                )
            ])
            .then((results) => {
                if (results[0].records.length === 0) {
                    console.log("collection not found..");
                    return res(new Error(`Collection with id ${id} was not found`))
                }

                const collection = mapIdentity(results[0].records[0].get(0))
                const edges = results[1].records[0].get(0).map(mapEdges)
                const nodes = results[2].records[0].get(0) === null ?
                    [] :
                    results[2].records.map(row => (
                        Object.assign({},
                            mapIdentity(row.get(0)),
                            {
                                collections: row.get(1).map(x => x.toString()), // ids for collections
                            }
                        )
                    ))

                return res(null, {
                    collection: Object.assign({},
                        collection,
                        { nodes }
                    ),
                    edges
                })
            })
            .catch(handleError)
        },

        getL1: function(user, id, res) {
            /*
             * Get abstraction with id ${id} including its children and their direct neighbours
             */

            const userId = user._id.toString()

            return Promise.all([
                /*
                 * Get collection and all collections in the chain to the root collection
                */
                db.run(
                    `MATCH (u:User)--(c:Collection)
                    WHERE u.id = {userId} AND c.id = {id}
                    OPTIONAL MATCH (c)-[:AbstractEdge*1..]->(c2:Collection)
                    RETURN properties(c) as collection, collect(distinct properties(c2)) as collections`,
                    {
                        id,
                        userId,
                    }
                ),
                // get all edges in the collection
                // TODO: should also filter out edges between parent collections and the nodes
                db.run(
                    `MATCH (u:User)--(c:Collection)
                    WHERE u.id = {userId} AND c.id = {id}
                    MATCH (c)<-[:AbstractEdge]-(n)-[e:EDGE]-(n2)
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
                db.run( `
                    MATCH (u:User)--(c:Collection)
                    WHERE u.id = {userId} AND c.id = {id}
                    MATCH (c)<-[:AbstractEdge]-(n) // children of this collection
                    OPTIONAL MATCH (n)-[e:EDGE]-(n2) // get neighbours
                    WITH collect(n) as nodes1, collect(n2) as nodes2
                    UNWIND nodes1 + nodes2 as nodes
                    WITH DISTINCT nodes
                    MATCH p=(nodes)-[:AbstractEdge*0..]->(:RootCollection)
                    WITH nodes, collect(extract(c IN tail(nodes(p)) | c.id)) as collections
                    OPTIONAL MATCH (nodes)<-[:AbstractEdge]-(children)
                    RETURN properties(nodes) as node, collections, COUNT(children)
                    `,
                    {
                        id,
                        userId,
                    }
                ),
            ])
                .then((results) => {
                    if (results[0].records.length === 0) {
                        console.log("collection not found..");
                        return res(new Error(`Collection with id ${id} was not found`))
                    }

                    const collection = Object.assign(
                        results[0].records[0].get(0),
                        { collectionChain: results[0].records[0].get(1) }
                    )

                    const edges = results[1].records.map(record => record.get('edge'))

                    let nodes = !results[2].records.length  ?
                        [] :
                        results[2].records.map(row => (
                            Object.assign({},
                                { collapsed: true },
                                row.get(0),
                                {
                                    collectionChains: row.get(1), // ids for collections
                                    count: row.get(2)
                                }
                            )
                        ))
                    // TODO: enforce this in the query
                    nodes = nodes.filter(x => x.id !== id)

                    const result = {
                        collection: Object.assign({},
                            collection,
                            { nodes } // all direct children
                        ),
                        edges // all edges between the nodes
                    }

                    if (res) {
                        return res(null, result)
                    }

                    return result
                })
                .catch(handleError)
        },

        create: function(user, id, parentId, data, res) {
            /*
             * Create a new collection connected to the root collection
             */

            if (!id || !parentId) {
                return res("set at least a name")
            }

            const edgeId = uuidV4()

            return db.run(`
                MATCH (u:User)--(p:Collection)
                WHERE u.id = {userId} AND p.id = {parentId}

                CREATE (c:Node:Collection {
                    id: {id},
                    name: {name},
                    type: "collection",
                    created: timestamp(),
                    modified: timestamp()
                 })<-[:AUTHOR]-(u)
                MERGE (c)-[e:AbstractEdge { id: {edgeId}, start: {id}, end: {parentId} }]->(p)
                return properties(c) as collection, properties(e) as edge
                `,
                {
                    userId: user._id.toString(),
                    id,
                    edgeId,
                    parentId,
                    name: data.name,
                }
            )
                .then((results) => {
                    const node = results.records[0]._fields[0]
                    const edge = results.records[0]._fields[1]

                    // TODO: want socket.io to handle promises
                    if (res) {
                        res(null, node)
                    }

                    // now update ES indexes
                    updateCollectionIndex(es, user, {
                        node,
                        edge
                    })

                    return node

                })
                .catch(handleError)
        },

        // TODO: not used at the moment - 2017-08-25
        connect: function(user, sourceId, targetId, id, res) {
            /*
             * Create the edge [sourceId]-[edge]->[targetId]
             */

            if (!sourceId || !targetId) {
                return res("Set both collection ids")
            }

            if (sourceId === targetId) {
                return res("Self referencing connections are not allowed")
            }

            return db.run(`
                MATCH (u:User)--(n1:Collection), (u:User)--(n2:Collection)
                WHERE u.id = {userId}
                AND n1.id = {sourceId} AND n2.id = {targetId}
                MERGE (n1)-[e:AbstractEdge { id: {id}, start: {sourceId}, end: {targetId} }]->(n2)
                RETURN properties(e) as edge
                `,
                {
                    id,
                    sourceId,
                    targetId,
                    userId: user._id.toString(),
                }
            )
                .then(results => {
                    const result = results.records[0]._fields[0]

                    if (res) {
                        res(null, result)
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

             // TODO: this results in node duplicated in Collection tree branch

            if (!collectionId || !nodeId) {
                return res("Set both node ids")
            }

            // TODO: does this make sense?
            if (!id) {
                return res("id must be explicitly passed")
            }

            // TODO: what if we add it to PKB directly?
            return db.run(`
                MATCH (u:User)--(c:Collection), (u:User)--(n:Node)
                WHERE u.id = {userId}
                AND c.id = {collectionId} AND n.id = {nodeId}
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
                MATCH (u:User)--(c:Collection)-[e]-(n:Node)--(u:User)
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
            */

            return Promise.all([
                // remove the AbstractEdge to the source abstraction
                db.run(
                    `
                    MATCH (u:User)--(n:Node), (u:User)--(c:Collection)
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
                    MATCH (u:User)--(n:Node), (u:User)--(c:Collection)
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
        },

    }
}
