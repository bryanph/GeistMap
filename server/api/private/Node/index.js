

"use strict"

const _ = require('lodash')
const neo4j = require('neo4j-driver').v1

const config = require('../../../config/config')
const { print, printTrace } = require('../../../utils/dev')

const uuidV4 = require('uuid/v4');

const {
    updateIndex,
    removeNodeDocument,
} = require('../../../fulltext')

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
     * initialized with
     * db: Neo4j database instance
     * es: Elasticsearch database instance
    */

    return {
        get: function(user, id, res) {
            db.run(`
                MATCH (u:User)--(n:Node)
                WHERE u.id = {userId} AND n.id = {id}
                OPTIONAL MATCH (n)-[:AbstractEdge*0..]->(c:Collection)
                RETURN properties(n) as node, collect(properties(c)) as collections
                `,
                {
                    id,
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(`Node with id ${id} was not found`)
                }

                const collections = results.records[0]._fields[1]

                res(null, {
                    node: Object.assign({},
                        results.records[0]._fields[0],
                        { collections: collections.map(x => x.id) }
                    ),
                    collections,
                })
            })
            .catch(handleError)
        },

        getArchive: function(user, res) {
            /*
             * Nodes without collections assigned to them
             * // TODO: Check this call's performance - 2016-07-11
             */

            db.run(
                "MATCH (u:User)--(n:Node) " +
                "WHERE u.id = {userId} " +
                "AND NOT (n)-[:IN]-(:Collection) " +
                "RETURN collect(properties(n)) as nodes",
                {
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(null, [])
                }

                console.log(results.records[0]._fields[0])

                res(null, results.records[0]._fields[0])
            })
            .catch(handleError)
        },

        getL1: function(user, id, res) {
            /*
             * Get node with id ${id} (including its neightbours)
             */

            db.run(`
                MATCH (u:User)--(n:Node)
                WHERE u.id = {userId} AND n.id = {id}
                OPTIONAL MATCH (n)-[:AbstractEdge*0..]->(c:Collection)
                OPTIONAL MATCH (n)-[e:EDGE]-(n2:Node)
                RETURN properties(n) as node, collect(distinct properties(n2)) as otherNodes, collect(distinct properties(e)) as edges, collect(distinct properties(c)) as collections
                `,
                {
                    userId: user._id.toString(),
                    id,
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(`Node with id ${id} was not found`)
                }

                const collections = results.records[0]._fields[3]

                res(null, {
                    node: Object.assign({},
                        results.records[0]._fields[0],
                        { collections: collections.map(x => x.id) }
                    ),
                    connectedNodes: results.records[0]._fields[1],
                    edges: results.records[0]._fields[2],
                    collections,
                })
            })
            .catch(handleError)
        },

        getL2: function(user, id, res) {
            /*
             * Get node with id ${id} (including adjacent nodes distance of max 2 away)
             */

            Promise.all([
                // get this node and its collections
                db.run(
                    `MATCH (u:User)--(n:Node)
                    WHERE u.id = {userId} AND n.id = {id}
                    OPTIONAL MATCH (n)-[:AbstractEdge]->(c:Collection)
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
                    OPTIONAL MATCH (n2)-[:AbstractEdge]->(c:Collection)
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

                let node = results[0].records[0].get(0)
                node.collections = results[0].records[0].get(1)

                const otherNodes = results[1].records.map(row => {
                    return Object.assign({},
                        row.get(0),
                        {
                            collections: row.get(1), // ids for collections
                        }
                    )
                })
                const otherEdges = results[2].records.map(row => row.get(0))

                const result = {
                    node,
                    connectedNodes: otherNodes,
                    edges: otherEdges,
                }

                console.log(result)

                res(null, result)
            })
            .catch(handleError)
        },

        create: function(user, id, data, res) {
            /*
             * Create a new (disconnected) node
             */

            if (!data.name) {
                return res("Set a title")
            }

            return db.run(`
                MERGE (u:User {id: {userId}})
                CREATE (n:Node { 
                    id: {id},
                    type: "node",
                    name: {name},
                    created: timestamp(),
                    modified: timestamp()
                })<-[:AUTHOR]-(u)
                RETURN properties(n) as node
                `,
                {
                    id,
                    userId: user._id.toString(),
                    name: data.name,
                }
            )
            .then((results) => {
                const result = 
                    Object.assign(results.records[0]._fields[0], {
                        collectionChains: []
                    })

                if (res) {
                    res(null, result)
                }

                // now update ES indexes
                updateIndex(es, user._id.toString(), result)

                return result

            })
            .catch(handleError)
        },

        update: function(user, id, data, res) {
            /*
             * Update properties of node with id ${id}
             */

            const updatedData = _.pick(data, ['name', 'content', 'editorState', 'editorPlainText'])

            return db.run(`
                MATCH (u:User)--(n)
                WHERE u.id = {userId} AND (n:Node OR n:Collection)
                AND n.id = {id}
                SET n += { data }
                SET n.modified = timestamp()
                RETURN properties(n) as node
                `,
                {
                    userId: user._id.toString(),
                    id: id,
                    data: updatedData,
                }
            )
            .then((results) => {
                const result = results.records[0]._fields[0]

                if (res) {
                    res(null, result)
                }

                // now update ES indexes...
                updateIndex(es, user._id.toString(), result)

                return result
            })
            .catch(handleError)
        },

        remove: function(user, id, res) {
            /*
             * Permanently delete node with id #{id}
             */
            // TODO: also prompt user to remove collections if they aren't referenced by any other nodes? - 2016-07-18
            return db.run(`
                MATCH (u:User)--(n:Node)
                WHERE u.id = {userId}
                AND n.id = {id}
                DETACH DELETE n
                `,
                {
                    userId: user._id.toString(),
                    id,
                }
            )
            .then(results => {

                if (res) {
                    res(null, true)
                }

                // now remove ES document
                removeNodeDocument(es, id)

                return true
            })
            .catch(handleError)
        },

        connect: function(user, node1, node2, id, res) {
            /*
             * Create the edge [node1]-[:EDGE]->[node2]
             */

            if (!node1 || !node2) {
                return res("Set both node ids")
            }

            if (node1 === node2) {
                return res("Self referencing connections are not allowed")
            }

            return db.run(`
                MATCH (u:User)--(n1:Node), (u:User)--(n2:Node)
                WHERE u.id = {userId}
                AND n1.id = {node1} AND n2.id = {node2}
                MERGE (n1)-[e:EDGE { id: {id}, start: n1.id, end: n2.id }]->(n2)
                RETURN properties(e) as edge
                `,
                {
                    node1,
                    node2,
                    id,
                    userId: user._id.toString(),
                    edgeType: 'EDGE',
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

        addEdge: function(user, node1, node2, id, text, res) {
            /*
             * Create a detailed edge from node1 to node2 with text as the context
            */

            // TODO: Create extra search indexes for the content

            if (!node1 || !node2) {
                return res("set both node ids")
            }

            if (node1 === node2) {
                return res("Self referencing connections are not allowed")
            }

            return db.run(`
                MATCH (u:User)--(n1:Node), (u:User)--(n2: Node)
                WHERE u.id = {userId}
                AND n1.id = {node1} AND n2.id = {node2}
                CREATE (n1)-[e:EDGE { 
                    id: {id},
                    content: {content},
                    start: {node1},
                    end: {node2}
                }]->(n2)
                RETURN properties(e) as edge
                `,
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
                const result = results.records[0]._fields[0]

                if (res) {
                    res(null, result)
                }

                return result
            })
            .catch(handleError)
        },

        removeEdge: function(user, id, res) {
            /*
             * Remove edge with id ${id}
             */

            return db.run(`
                MATCH (u:User)--(:Node)-[e]->(:Node)--(u:User)
                WHERE u.id = {userId}
                AND e.id = {id}
                DELETE e
                `,
                {
                    id,
                    userId: user._id.toString(),
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

        toCollection: function(user, id, res) {

            return db.run(
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
                const result = results.records[0]._fields[0]

                if (res) {
                    res(null, result)
                }

                // now update ES indexes...
                updateIndex(es, user._id.toString(), result)

                return result
            })
            .catch(handleError)
        },

        search: function(user, query, res) {
            /*
             * Full text search for a node
            */

            // TODO: Index abstractions and nodes the same way

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
