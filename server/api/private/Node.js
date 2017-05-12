

"use strict"

const _ = require('lodash')
const neo4j = require('neo4j-driver').v1

const config = require('../../config/config')
const { print, printTrace } = require('../../utils/dev')

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

function mapIdentity(node) {
    node.id = node.identity.toString();
    if (node.properties.created) {
        node.properties.created = node.properties.created.toNumber()
    }
    if (node.properties.modified) {
        node.properties.modified = node.properties.modified.toNumber()
    }
    if (node.properties.collections) {
        node.properties.collections = node.properties.collections.map(x => x.toString())
    }
    if (node.properties.nodes) {
        node.properties.nodes = node.properties.nodes.map(x => x.toString())
    }
    delete node.identity
    return node
}

function mapEdges(node) {
    node.id = node.identity.toString();
    node.start = node.start.toString();
    node.end = node.end.toString();
    delete node.identity
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
                "RETURN collect(c) as nodes, collect(r) as edges",
                {
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                return res(null, {
                    nodes: results.records[0]._fields[0].map(mapIdentity),
                    edges: results.records[0]._fields[1].map(mapEdges),
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
                "AND NOT (n)-[:IN]-(:Collection) " +
                "RETURN collect(n) as nodes",
                {
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(null, { nodes: [] })
                }

                res(null, {
                    nodes: results.records[0]._fields[0].map(mapIdentity)
                })
            })
            .catch(handleError)
        },

        get: function(user, id, res) {
            // TODO: also need the outgoing edges for ContentLink - 2016-10-20
            db.run(
                "MATCH (u:User)--(n:Node) " +
                "WHERE u.id = {userId} AND id(n) = {id} " +
                "OPTIONAL MATCH (n)-[:IN]->(:Collection)-[*0..5]->(c:Collection) " +
                "RETURN n as node, collect(c) as collections",
                {
                    id: neo4j.int(id),
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(`Node with id ${id} was not found`)
                }

                const collections = results.records[0]._fields[1].map(mapIdentity)

                res(null, {
                    node: Object.assign({},
                        mapIdentity(results.records[0]._fields[0]),
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
                "WHERE u.id = {userId} AND id(n) = {id} " +
                "OPTIONAL MATCH (n)-[:IN]->(:Collection)-[*0..5]->(c:Collection) " +
                "OPTIONAL MATCH (n)-[e:EDGE]-(n2:Node) " +
                "RETURN n as node, collect(distinct n2) as otherNodes, collect(distinct e) as edges, collect(distinct c) as collections",
                {
                    userId: user._id.toString(),
                    id: neo4j.int(id),
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(`Node with id ${id} was not found`)
                }

                const collections = results.records[0]._fields[3].map(mapIdentity)

                res(null, {
                    node: Object.assign({},
                        mapIdentity(results.records[0]._fields[0]),
                        { collections: collections.map(x => x.id) }
                    ),
                    connectedNodes: results.records[0]._fields[1].map(mapIdentity),
                    edges: results.records[0]._fields[2].map(mapEdges),
                    collections,
                })
            })
            .catch(handleError)
        },

        getL2: function(user, id, res) {
            /*
             * Get node with id ${id} (including adjacent nodes distance of max 2 away)
             * // TODO: Check this call's performance - 2016-07-11
             */

            // TODO: Limit the number of results and notify if the numer of results were limited for performance reasons- 2016-07-15
            db.run(
                "MATCH (u:User)--(n:Node)-[e:EDGE*0..2]-(n2:Node) " +
                // rule for matching nodes that are distance of 3 away, but target node is "in" the max path
                // "OPTIONAL MATCH (n2)-[e:EDGE]-(n3:Node) WHERE n3" + 
                "WHERE u.id = {userId} " +
                "AND id(n) = {id} " +
                "OPTIONAL MATCH (n)-[:IN]->(:Collection)-[*0..5]->(c:Collection) " +
                "RETURN n as node, collect(distinct n2) as otherNodes, collect(distinct e) as edges, collect(c) as collections",
                {
                    id: neo4j.int(id),
                    userId: user._id.toString(),
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    return res(`Node with id ${id} was not found`)
                }

                // const collections = results.records[0]._fields[3].map(mapIdentity)

                res(null, {
                    node: Object.assign({},
                        mapIdentity(results.records[0]._fields[0]),
                        { collections: results.records[0]._fields[3].map(mapIdentity) }
                    ),
                    connectedNodes: results.records[0]._fields[1].map(mapIdentity),
                    // TODO: do this in neo4j instead - 2016-07-18
                    edges: _.flatMap(results.records[0]._fields[2]).map(mapEdges),
                    // edges: results.records[0]._fields[2].map(mapEdges),
                    // collections,
                })
            })
            .catch(handleError)
        },

        create: function(user, data, res) {
            /*
             * Create a new node
             */

            data.author = user;

            db.run(
                "MERGE (u:User {id: {userId}}) " +
                "CREATE (n:Node { name: {name}, created: timestamp(), modified: timestamp()})<-[:AUTHOR]-(u) " +
                "return n as node",
                {
                    userId: user._id.toString(),
                    name: data.name,
                }
            )
            .then((results) => {
                const result = mapIdentity(results.records[0]._fields[0])

                res(null, result)

                // now update ES indexes
                updateIndex(es, user._id.toString(), result)
                    
            })
            .catch(handleError)
        },

        createBatchNode: function(user, data, res) {
            /*
             * Create a "batch create node" separately so we can perform
             * clean-up later on, and provide persistence of sessions later on as well
             * // TODO: create nodes on client-side only, then persist later when user changes its name - 2016-07-23
            */

            data.author = user;

            db.run(
                "MERGE (u:User {id: {userId}}) " +
                "CREATE (n:Node:BatchNode { name: {name}, created: timestamp(), modified: timestamp()})<-[:AUTHOR]-(u) " +
                "return n as node",
                {
                    userId: user._id.toString(),
                    name: data.name,
                }
            )
            .then((results) => {
                const result = mapIdentity(results.records[0]._fields[0])

                res(null, result)

                // now update ES indexes
                updateIndex(es, user._id.toString(), result)
                    
            })
            .catch(handleError)
        },

        getAllBatchNodes: function(user, res) {
            /*
             * Get all nodes created in the batch create graph
             */

            // TODO: fetch collections for nodes here as well? - 2016-08-24
            db.run(
                "MATCH (u:User)--(n:BatchNode) " +
                "WHERE u.id = {userId} " +
                "OPTIONAL MATCH (n)-[:IN]->(:Collection)-[*0..5]->(c:Collection) " +
                "OPTIONAL MATCH (n)-[r:EDGE]->(:BatchNode) " +
                "RETURN n, collect(c), collect(r) " +
                "ORDER BY n.modified DESC",
                {
                    userId: user._id.toString(),
                }
            )
            .then((results) => {
                // TODO: we shouldn't need collect() - 2016-07-23
                //

                return res(null, results.records.map( row => (
                    Object.assign({},
                        mapIdentity(row.get(0)),
                        {
                            collections: row.get(1).map(mapIdentity),
                            edges: row.get(2).map(mapEdges),
                        }
                    )
                )))
            })
            .catch(handleError)
        },

        clearBatchNodes: function(user, res) {
            /*
             * Remove batch label from all batch nodes
             * // TODO: Additionally remove untitled nodes? - 2016-07-23
             */

            db.run(
                "MATCH (u:User)--(n:BatchNode) " +
                "WHERE u.id = {userId} " +
                "REMOVE n:BatchNode " +
                "RETURN n as node",
                {
                    userId: user._id.toString()
                }
            )
            .then((results) => {
                // const result = mapIdentity(results.records[0]._fields[0])

                return res(null, true)
                // return res(null, {
                //     nodes: results.records[0]._fields[0].map(mapIdentity),
                //     edges: results.records[0]._fields[1].map(mapEdges),
                // })
            })
            .catch(handleError)
        },

        update: function(user, id, data, res) {
            /*
             * Update properties of node with id ${id}
             */

            const updatedData = _.pick(data, ['name', 'content', 'editorState', 'editorPlainText'])

            db.run(
                "MATCH (u:User)--(n:Node) " +
                "WHERE u.id = {userId} " +
                "AND id(n) = {id} " +
                "SET n = { data } " +
                "SET n.modified = timestamp() " +
                "RETURN n as node",
                {
                    userId: user._id.toString(),
                    id: neo4j.int(id),
                    data: updatedData,
                }
            )
            .then((results) => {
                const result = mapIdentity(results.records[0]._fields[0])

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
                "AND id(n) = {id} " +
                "DETACH DELETE n",
                {
                    userId: user._id.toString(),
                    id: neo4j.int(id),
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

        duplicate: function(user, nodeId, isBatch=false, res) {
            
            db.run(
                "MATCH (u:User)--(n:Node) " +
                "WHERE u.id = {userId} "  +
                "AND id(n) = {id} " +
                "CREATE (u)-[:AUTHOR]->(nn:Node" + (isBatch ? ":BatchNode" : "") + " { name: 'copy of ' + n.name, created: timestamp(), modified: timestamp() }) " +
                "WITH n as n, nn as nn " +
                "OPTIONAL MATCH (n)--(c:Collection) " +
                // "CREATE (nn)-[:IN]->(c) " +
                "WITH n as n, nn as nn, collect(c) as c " +
                "FOREACH (col IN c | CREATE (nn)-[:IN]->(col)) " +
                "RETURN nn, c",
                {
                    userId: user._id.toString(),
                    id: neo4j.int(nodeId),
                }
            )
            .then(results => {
                const node = mapIdentity(results.records[0]._fields[0])
                const collections = results.records[0]._fields[1].map(mapIdentity)

                res(null, Object.assign(node,
                    { collections }
                ))

                // res(null, {
                //     ...node,
                //     collections,
                // })

                // now update ES indexes
                updateIndex(es, user._id.toString(), node)
            })
            .catch(handleError)
        },

        delete: function(user, data, res) {
            /*
             * Permanently delete node with id #{id}
             */

            // TODO: Also remove indexes and other dangling references... - 2016-07-11

        },

        connect: function(user, node1, node2, isBatch=false, res) {
            /*
             * Create the edge [node1]-[edge]->[node2]
             * Additionally, update collection relations
             * if isBatch=true, make nodes a Batch node as well
             */

            // TODO: Add an edge type argument - 2016-06-06
            // TODO: assert edge type is defined - 2016-04-02
            // TODO: How will we manage this? 2016-04-02

            if (typeof node1 === 'string') {
                node1 = parseInt(node1)
            }

            if (typeof node2 === 'string') {
                node2 = parseInt(node2)
            }

            if (!typeof node1 === 'number' || !typeof node2 === 'number') {
                return res("Set both node ids")
            }

            if (node1 === node2) {
                return res("Self referencing connections are not allowed")
            }

            db.run(
                "MATCH (u:User)--(n1:Node), (u:User)--(n2:Node) " +
                "WHERE u.id = {userId} " +
                "AND id(n1) = {node1} AND id(n2) = {node2} " +
                (isBatch ? "SET n1:BatchNode, n2:BatchNode " : "") +
                "MERGE (n1)-[e:EDGE]->(n2) " +
                "RETURN e as edge",
                {
                    node1: neo4j.int(node1),
                    node2: neo4j.int(node2),
                    userId: user._id.toString(),
                    edgeType: 'EDGE',
                }
            )
            .then(results => {
                // TODO: only return the edge that was changed 2016-06-08
                const result = mapEdges(results.records[0]._fields[0])

                res(null, result)
            })
            .catch(handleError)
        },

        disconnect: function(user, node1, node2, res) {
            /*
             * Remove all edges between node1 and node2
             */
        },

        addEdge: function(user, node1, node2, text, res) {
            /*
             * Create a detailed edge from node1 to node2 with text as the context
            */

            // TODO: how to represent the content? - 2016-06-25
            //      - as plain text
            // store the content as attribute in the edge?
            // TODO: create an elastic search index for the content - 2016-06-25
            // TODO: Need to store extra info about the text? - 2016-06-25
            // TODO: How to deal with overlapping edge content? - 2016-06-25

            if (typeof node1 === 'string') {
                node1 = parseInt(node1)
            }

            if (typeof node2 === 'string') {
                node2 = parseInt(node2)
            }

            if (!typeof node1 === 'number' || !typeof node2 === 'number') {
                console.error("Set both node ids")
            }

            if (node1 === node2) {
                return res("Self referencing connections are not allowed")
            }

            db.run(
                "MATCH (u:User)--(n1:Node), (u:User)--(n2: Node) " +
                "WHERE u.id = {userId} " +
                "AND id(n1) = {node1} AND id(n2) = {node2} " +
                "CREATE (n1)-[e:EDGE { content: {content} }]->(n2) " +
                "RETURN e as edge",
                {
                    node1: neo4j.int(node1),
                    node2: neo4j.int(node2),
                    userId: user._id.toString(),
                    edgeType: 'EDGE',
                    content: text,
                }
            )
            .then(results => {
                // TODO: only return the edge that was changed 2016-06-08
                const result = mapEdges(results.records[0]._fields[0])
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
                "AND id(e) = {id} " +
                "DELETE e",
                {
                    id: neo4j.int(id),
                    userId: user._id.toString(),
                }
            )
            .then(results => {

                res(null, true)
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
