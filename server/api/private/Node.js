

"use strict"

const _ = require('lodash')
const neo4j = require('neo4j-driver').v1

const config = require('../../config/config')
const { print, printTrace } = require('../../utils/dev')

const uuidV4 = require('uuid/v4');

const {
    updateIndex,
    removeNodeDocument,
} = require('../../fulltext')

function handleError(error) {
    if (error.stack) {
        console.error(error.stack)
    }
    else {
        console.error(error)
    }
}

function mapIntegers(node) {
    if (node.created) {
        node.created = node.created.toString()
    }
    if (node.modified) {
        node.modified = node.modified.toString()
    }
    if (node.collections) {
        node.collections = node.collections.map(x => x.toString())
    }
    if (node.nodes) {
        node.nodes = node.nodes.map(x => x.toString())
    }

    return node
}

module.exports = function(db, es) {
    /*
     * initialized with
     * db: Neo4j database instance
     * es: Elasticsearch database instance
    */

    return {
        getAll: function(user, res) {
            /*
             * Get all nodes
             */

            db.run(
                "MATCH (u:User)--(c:Node)-[r]-(:Node) " +
                "WHERE u.id = {userId} " +
                "RETURN collect(properties(c)) as nodes, collect(properties(r)) as edges",
                {
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                return res(null, {
                    nodes: results.records[0]._fields[0].map(mapIntegers),
                    edges: results.records[0]._fields[1].map(mapIntegers),
                })
            })
            .catch(handleError)
        },

        getInboxNodes: function(user, res) {
            /*
             * Nodes without collections assigned to them
             * // TODO: Check this call's performance - 2016-07-11
             */

            db.run(
                "MATCH (u:User)--(n:Node) " +
                "WHERE u.id = {userId} " +
                "AND NOT (n)-[:AbstractEdge]-(:Collection) " +
                "RETURN collect(properties(n)) as nodes",
                {
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(null, { nodes: [] })
                }

                res(null, {
                    nodes: results.records[0]._fields[0].map(mapIntegers)
                })
            })
            .catch(handleError)
        },

        get: function(user, id, res) {
            // TODO: also need the outgoing edges for ContentLink - 2016-10-20
            db.run(
                "MATCH (u:User)--(n:Node) " +
                "WHERE u.id = {userId} AND n.id = {id} " +
                "OPTIONAL MATCH (n)-[:AbstractEdge*0..]->(c:Collection) " +
                "RETURN properties(n) as node, collect(properties(c)) as collections",
                {
                    id,
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(`Node with id ${id} was not found`)
                }

                const collections = results.records[0]._fields[1].map(mapIntegers)

                res(null, {
                    node: Object.assign({},
                        mapIntegers(results.records[0]._fields[0]),
                        { collections: collections.map(x => x.id) }
                    ),
                    collections,
                })
            })
            .catch(handleError)
        },

        getWithNeighbours: function(user, id, res) {
            /*
             * Get node with id ${id} (including its neightbours)
             * // TODO: Check this call's performance - 2016-07-11
             */

            db.run(
                "MATCH (u:User)--(n:Node) " +
                "WHERE u.id = {userId} AND n.id = {id} " +
                "OPTIONAL MATCH (n)-[:AbstractEdge*0..]->(c:Collection) " +
                "OPTIONAL MATCH (n)-[e:EDGE]-(n2:Node) " +
                "RETURN properties(n) as node, collect(distinct properties(n2)) as otherNodes, collect(distinct properties(e)) as edges, collect(distinct properties(c)) as collections",
                {
                    userId: user._id.toString(),
                    id,
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(`Node with id ${id} was not found`)
                }

                const collections = results.records[0]._fields[3].map(mapIntegers)

                res(null, {
                    node: Object.assign({},
                        mapIntegers(results.records[0]._fields[0]),
                        { collections: collections.map(x => x.id) }
                    ),
                    connectedNodes: results.records[0]._fields[1].map(mapIntegers),
                    edges: results.records[0]._fields[2],
                    collections,
                })
            })
            .catch(handleError)
        },

        getL2: function(user, id, res) {
            /*
             * Get node with id ${id} (including adjacent nodes distance of max 2 away)
             * // TODO: should also get collection ids of all nodes - 2017-05-23
             */

            // TODO: Limit the number of results and notify if the numer of results were limited for performance reasons- 2016-07-15
            Promise.all([
                // get this node
                db.run(
                    `MATCH (u:User)--(n:Node) 
                    WHERE u.id = {userId} AND n.id = {id}
                    OPTIONAL MATCH (n)-[:AbstractEdge*0..]->(c:Collection)
                    RETURN properties(n), collect(distinct properties(c))`,
                    {
                        id,
                        userId: user._id.toString(),
                    }
                ),
                // get all the nodes within a path 2 of node (including the node itself) along with their collections
                db.run(
                    `MATCH (u:User)--(n:Node) 
                    WHERE u.id = {userId} AND n.id = {id}
                    OPTIONAL MATCH (n)-[:EDGE*0..2]-(n2:Node)
                    WITH distinct n2
                    OPTIONAL MATCH (n2)-[:AbstractEdge*0..]->(c:Collection)
                    RETURN properties(n2), collect(distinct c.id)`,
                    // ORDER BY n2.id`,
                    {
                        id,
                        userId: user._id.toString(),
                    }
                ),
                // get all edges for l2
                db.run(
                    `MATCH (u:User)--(n:Node)
                    WHERE u.id = {userId} AND n.id = {id}
                    OPTIONAL MATCH path=(n)-[e:EDGE*0..2]-(:Node)
                    WITH rels(path) as rels
                    UNWIND rels as rel
                    WITH DISTINCT rel
                    RETURN properties(rel)`,
                    {
                        id,
                        userId: user._id.toString(),
                    }
                ),
            ])
            .then((results) => {
                if (results[0].records.length === 0) {
                    return res(`Node with id ${id} was not found`)
                }

                let node = mapIntegers(results[0].records[0].get(0))
                node.collections = results[0].records[0].get(1).map(mapIntegers)

                const otherNodes = results[1].records.map(row => {
                    return Object.assign({},
                        mapIntegers(row.get(0)),
                        {
                            collections: row.get(1), // ids for collections
                        }
                    )
                })
                const otherEdges = results[2].records.map(row => row.get(0))

                res(null, {
                    node,
                    connectedNodes: otherNodes,
                    edges: otherEdges,
                })
            })
            .catch(handleError)
        },

        create: function(user, id, data, res) {
            /*
             * Create a new node
             */

            if (!data.name) {
                return res("Set a title")
            }

            db.run(
                "MERGE (u:User {id: {userId}}) " +
                "CREATE (n:Node { id: {id}, type: \"node\", name: {name}, created: timestamp(), modified: timestamp()})<-[:AUTHOR]-(u) " +
                "return properties(n) as node",
                {
                    id,
                    userId: user._id.toString(),
                    name: data.name,
                }
            )
            .then((results) => {
                const result = mapIntegers(
                    Object.assign(results.records[0]._fields[0], {
                        collections: []
                    })
                )

                res(null, result)

                // now update ES indexes
                updateIndex(es, user._id.toString(), result)
                    
            })
            .catch(handleError)
        },

        update: function(user, id, data, res) {
            /*
             * Update properties of node with id ${id}
             */

            const updatedData = _.pick(data, ['name', 'content', 'editorState', 'editorPlainText'])

            db.run(
                "MATCH (u:User)--(n) " +
                "WHERE u.id = {userId} AND (n:Node OR n:Collection) " +
                "AND n.id = {id} " +
                "SET n += { data } " +
                "SET n.modified = timestamp() " +
                "RETURN properties(n) as node",
                {
                    userId: user._id.toString(),
                    id,
                    data: updatedData,
                }
            )
            .then((results) => {
                const result = mapIntegers(results.records[0]._fields[0])

                res(null, result)

                // now update ES indexes...
                updateIndex(es, user._id.toString(), result)
            })
            .catch(handleError)
        },

        remove: function(user, id, res) {
            /*
             * Permanently delete node with id #{id}
             */

            // TODO: also prompt user to remove collections if they aren't referenced by any other nodes? - 2016-07-18
            db.run(
                "MATCH (u:User)--(n:Node) " +
                "WHERE u.id = {userId} "  +
                "AND n.id = {id} " +
                "DETACH DELETE n",
                {
                    userId: user._id.toString(),
                    id,
                }
            )
            .then(results => {
                res(null, true)

                // now remove ES document
                removeNodeDocument(es, id)

                // TODO: also update collection count - 2016-08-01
            })
            .catch(handleError)

            // TODO: Also remove indexes and other dangling references... - 2016-07-11

        },

        connect: function(user, node1, node2, id, res) {
            /*
             * Create the edge [node1]-[edge]->[node2]
             * Additionally, update collection relations
             */

            // TODO: Add an edge type argument - 2016-06-06
            // TODO: assert edge type is defined - 2016-04-02
            // TODO: How will we manage this? 2016-04-02

            if (!node1 || !node2) {
                return res("Set both node ids")
            }

            if (node1 === node2) {
                return res("Self referencing connections are not allowed")
            }

            console.log(node1, node2);

            db.run(
                "MATCH (u:User)--(n1:Node), (u:User)--(n2:Node) " +
                "WHERE u.id = {userId} " +
                "AND n1.id = {node1} AND n2.id = {node2} " +
                "MERGE (n1)-[e:EDGE { id: {id}, start: n1.id, end: n2.id }]->(n2) " +
                "RETURN properties(e) as edge",
                {
                    node1,
                    node2,
                    id,
                    userId: user._id.toString(),
                    edgeType: 'EDGE',
                }
            )
            .then(results => {
                // TODO: only return the edge that was changed 2016-06-08
                const result = results.records[0]._fields[0]

                res(null, result)
            })
            .catch(handleError)
        },

        disconnect: function(user, node1, node2, res) {
            /*
             * Remove all edges between node1 and node2
             */
        },

        addEdge: function(user, node1, node2, id, text, res) {
            /*
             * Create a detailed edge from node1 to node2 with text as the context
            */

            // TODO: how to represent the content? - 2016-06-25
            //      - as plain text
            // store the content as attribute in the edge?
            // TODO: create an elastic search index for the content - 2016-06-25
            // TODO: Need to store extra info about the text? - 2016-06-25
            // TODO: How to deal with overlapping edge content? - 2016-06-25

            if (!node1 || !node2) {
                return res("set both node ids")
            }

            if (node1 === node2) {
                return res("Self referencing connections are not allowed")
            }

            db.run(
                "MATCH (u:User)--(n1:Node), (u:User)--(n2: Node) " +
                "WHERE u.id = {userId} " +
                "AND n1.id = {node1} AND n2.id = {node2} " +
                "CREATE (n1)-[e:EDGE { id: {id}, content: {content} }]->(n2) " +
                "RETURN properties(e) as edge",
                {
                    id,
                    node1,
                    node2,
                    userId: user._id.toString(),
                    edgeType: 'EDGE',
                    content: text,
                }
            )
            .then(results => {
                // TODO: only return the edge that was changed 2016-06-08
                const result = results.records[0]._fields[0]
                res(null, result)
            })
            .catch(handleError)
        },

        removeEdge: function(user, id, res) {
            /*
             * Remove edge with id ${id}
             */

            db.run(
                "MATCH (u:User)--(:Node)-[e]->(:Node)--(u:User) " +
                "WHERE u.id = {userId} " +
                "AND e.id = {id} " +
                "DELETE e",
                {
                    id,
                    userId: user._id.toString(),
                }
            )
            .then(results => {

                res(null, true)
            })
            .catch(handleError)
        },

        moveToAbstraction: function(user, sourceCollectionId, sourceId, targetId, edgeId, res) {
            /*
             * move the source to be in the target collection
            */

            Promise.all([
                // remove the node to be moved from the parent collection
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
                    // move the node to the collection with targetId 
                    `
                    MATCH (u:User)--(n:Node), (u:User)--(c:Collection)
                    WHERE u.id = {userId} AND n.id = {sourceId} AND c.id = {targetId}
                    CREATE (n)-[e:AbstractEdge { id: {edgeId}, start: {sourceId}, end: {targetId} }]->(c)
                    RETURN e
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

                res(null, result)
            })
            .catch(handleError)
        },


        removeAbstraction: function(user, sourceCollectionId, id, res) {
            /*
             * This converts the abstraction to a node and the edges to normal edges
             * instead it adds all the nodes to the sourceCollection with id sourceCollectionId
            */

            const edgeId = uuidV4();
            const abstractEdgeId = uuidV4();

            console.log(sourceCollectionId, id);

            db.run(
                `
                MATCH (u:User)--(n:Collection)
                WHERE u.id = {userId} AND n.id = {id}
                MATCH (n)<-[e:AbstractEdge]-(n2:Node)
                SET n.type = 'node'
                REMOVE n:Collection
                DELETE e
                CREATE (n)-[:EDGE { id: {edgeId}, start: n.id, end: n2.id }]->(n2)
                CREATE (n)<-[:AbstractEdge { id: { abstractEdgeId }, start: n.id, end: n2.id }]-(n2)
                `,
                {
                    userId: user._id.toString(),
                    id,
                    edgeId,
                    abstractEdgeId,
                }
            )
            .then(results => {
                return res(null, true) // success
            })
            .catch(handleError)
        },

        convertNodeToCollection: function(user, id, res) {
            db.run(
                `
                MATCH (u:User)--(n:Node)
                WHERE u.id = {userId} AND n.id = { id }
                REMOVE n:Node
                SET n:Node:Collection
                SET n.type = 'collection'
                RETURN properties(n) as node
                `,
                {
                    userId: user._id.toString(),
                    id,
                }
            )
            .then((results) => {
                const result = mapIntegers(results.records[0]._fields[0])

                res(null, result)

                // now update ES indexes...
                updateIndex(es, user._id.toString(), result)
            })
            .catch(handleError)
        },

        convertCollectionToNode: function(user, id, res) {
            db.run(
                `
                MATCH (u:User)--(n:Collection)
                WHERE u.id = {userId} AND n.id = { id }
                REMOVE n:Collection
                SET n:Node
                SET n.type = 'node'
                RETURN properties(n) as node
                `,
                {
                    userId: user._id.toString(),
                    id,
                }
            )
            .then((results) => {
                const result = mapIntegers(results.records[0]._fields[0])

                res(null, result)

                // now update ES indexes...
                updateIndex(es, user._id.toString(), result)
            })
            .catch(handleError)
        },

        search: function(user, query, res) {
            /*
             * Full text search for a node
            */

            es.search({
                index: config.es.nodeIndex,
                body: {
                    "min_score": 0.1,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": { "user": user._id.toString() }
                                }

                            ],
                            "should": [
                            {
                                // TODO: make this match exactly (needs a separate index) - 2016-07-26
                                "match": {
                                    "title": {
                                        query,
                                        "operator": "and",
                                        "boost": 10,
                                    }
                                }
                            },
                            {
                                "match": {
                                    "title": {
                                        query,
                                        "fuzziness": "AUTO",
                                        // "boost": 3,
                                    }
                                }
                            },
                            {
                                "match": {
                                    "content": {
                                        query,
                                        // TODO: should be AND? - 2016-07-26
                                        // TODO: AND with minimum amount of words - 2016-07-26
                                        "operator": "and",
                                    }
                                },
                            }
                            ]
                        }
                    }
                }
            })
           .then(body => {
               res(null, body.hits.hits)
           })
           .catch(error => {
               console.error(error)
           })
        },
        searchAll: function(user, query, res) {
            /*
             * Full text search for all indexed entities
            */

            es.search({
                index: [config.es.nodeIndex, config.es.collectionIndex],
                body: {
                    "min_score": 0.1,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": { "user": user._id.toString() }
                                }

                            ],
                            "should": [
                            {
                                // TODO: make this match exactly (needs a separate index) - 2016-07-26
                                "match": {
                                    "title": {
                                        query,
                                        "operator": "and",
                                        "boost": 10,
                                    }
                                }
                            },
                            {
                                "match": {
                                    "title": {
                                        query,
                                        "fuzziness": "AUTO",
                                        // "boost": 3,
                                    }
                                }
                            },
                            {
                                "match": {
                                    "content": {
                                        query,
                                        // TODO: should be AND? - 2016-07-26
                                        // TODO: AND with minimum amount of words - 2016-07-26
                                        "operator": "and",
                                    }
                                },
                            }
                            ]
                        }
                    }
                }
            })
           .then(body => {
               res(null, body.hits.hits)
           })
           .catch(error => {
               console.error(error)
           })
        },
    }
}
