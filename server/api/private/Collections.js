
"use strict"

import DatabaseContainer from '../../utils/DatabaseContainer'
import _ from 'lodash'
const neo4j = require('neo4j-driver').v1

import config from '../../config/config'
import { print, printTrace } from '../../utils/dev'

import {
    updateCollectionIndex,
    removeCollectionDocument,
} from '../../fulltext'

function handleError(error) {
    console.log(error);
    console.error(error.stack)
}

// TODO: these functions are terrible... - 2016-07-13
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

export default function(db, es) {
    /*
     * initialize with
     * db: Neo4j database instance
     * es: Elasticsearch database instance
    */

    return {
        // get: function(user, id, res) {
        //     console.log("called get with id " + id);

        //     // TODO: patch db.cypher to use promises - 2016-05-29
        //     db.run(
        //         "MATCH (c:Collection) " +
        //         "WHERE id(c) = {id} " +
        //         "RETURN c as collection",
        //         {
        //             id: neo4j.int(id),
        //         }
        //     )
        //     .then((results) => {
        //         if (results.length === 0) {
        //             return res(`Collection with id ${id} was not found`)
        //         }

        //         res(null, {
        //             collection: {
        //                 ...mapIdentity(results.records[0]._fields[0]),
        //             },
        //         })
        //     })
        //     .catch(handleError)
        // },



            // db.run(
            //     "MATCH (c:Collection)-[]-(n:Node)-[e:EDGE*0..1]-(n2:Node)" +
            //     // "MATCH (c:Collection)-[]-(n:Node)-[r:EDGE*1..2]-(n2:Node)" +
            //     // "OPTIONAL MATCH (n:Node)-[IN]->(c:Collection) " +
            //     "WHERE id(c) = {id} " +
            //     "RETURN collect(distinct n + n2) as nodes, collect(distinct e) as edges")
            // .then((results) => {

            //     return res(null, {
            //         collection:
            //         nodes: results.records[0]._fields[0].map(mapIdentity),
            //         edges: results.records[0]._fields[1].map(mapEdges),
            //     })
        get: function(user, id, res) {
            /*
             * Get node with id ${id} (including its neightbours)
             * // TODO: give this call an explicit name - 2016-07-15
             * // TODO: Check this call's performance - 2016-07-11
             */

            // console.log("called get with id " + id);

            db.run(
                "MATCH (u:User)--(c:Collection)" +
                "WHERE u.id = {userId} " +
                "AND id(c) = {id} " +
                "OPTIONAL MATCH (c)<-[*0..5]-(:Collection)--(n:Node)-[e:EDGE*0..1]-(n2:Node) " +
                // "OPTIONAL MATCH (c)<-[r:PARENT*0..5]-(:Collection)--(n:Node) " +
                "RETURN c, collect(distinct n2), collect(distinct e)",
                {
                    id: neo4j.int(id),
                    userId: user._id.toString(),
                }
            )
            .then((results) => {
                if (results.records.length === 0) {
                    console.log("node not found..");
                    return res(new Error(`Node with id ${id} was not found`))
                }

                res(null, {
                    collection: mapIdentity(results.records[0]._fields[0]),
                    nodes: results.records[0]._fields[1].map(mapIdentity),
                    edges: _.flatMap(results.records[0]._fields[2]).map(mapEdges),
                })
            })
            .catch(handleError)
        },

        // getByIds: function(user, ids, res) {
        //     /*
        //      * Get node with id ${id} (including its neightbours)
        //      * // TODO: Check this call's performance - 2016-07-11
        //      * // TODO: can this call work? - 2016-07-13
        //      */

        //     console.log("called getByIds with id " + ids);
        //     // TODO: don't get neighbours in this call? - 2016-07-13

        //     db.run(
        //         "MATCH (u:User)--(c:Collection)-[:IN*0..1]-(n:Node)-[e:EDGE*0..1]-() " +
        //         "WHERE u.id = {userId} " +
        //         "AND id(c) IN {ids} " +
        //         "RETURN collect(c) as collections, collect(n) as nodes, collect(distinct e) as edges",
        //         {
        //             userId: user._id.toString(),
        //             ids: ids.map(id => neo4j.int(id)),
        //         }
        //     )
        //     .then((results) => {
        //         if (results.records.length === 0) {
        //             console.log("node not found..");
        //             return res(new Error(`Node with id ${ids} was not found`))
        //         }

        //         res(null, {
        //             collection: mapIdentity(results.records[0]._fields[0]),
        //             nodes: results.records[0]._fields[1].map(mapIdentity),
        //             edges: _.flatMap(results.records[0]._fields[2]).map(mapEdges),
        //         })
        //     })
        //     .catch(handleError)
        // },

        getAll: function(user, res) {
            /*
             * Get all collections and their relationships
             * TODO: 2016-08-11 - These relationships define hierarchies
             */

            // TODO: Explicit relations (between collections) - 2016-07-11
            // TODO: Implicit relations (between two nodes in collections - 2016-07-11
            // TODO: Separate explicit and implicit relations? - 2016-04-02
            // TODO: Separate explicit and implicit relations? - 2016-04-02

            db.run(
                "MATCH (u:User)--(c:Collection) " +
                "WHERE u.id = {userId} " +
                "OPTIONAL MATCH (c)<-[r:PARENT*0..5]-(c2:Collection) " +
                "OPTIONAL MATCH (c2)--(n:Node) " +
                "RETURN c, collect(distinct r), count(n)",
                {
                    userId: user._id.toString()
                }
            )
            .then((results) => {

                return res(null, results.records.map(row => ({
                        ...mapIdentity(row.get(0)),
                        edges: _.flatten(row.get(1)).map(mapEdges),
                        count: row.get(2).toNumber(),
                    }))
                )
            })
            .catch(handleError)
        },

        // getCollectionGraph: function(user, res) {
        //     /*
        //      * Get a collection graph
        //      *
        //     */

        //     db.cypher({
        //         query: 
        //             "MATCH (c1:Collection)-[e]-(n: Node), (n1: Node -[]-> (n2: Node))" +
        //             "WHERE NOT (c1)-[e:IN|CONTAINS]-(c2)" +
        //             "RETURN collect(c1, c2) as collections, collect(e) as edges"
        //     }, function(error, results) {
        //         res(null, results[0].collections)
        //     })
        // },

        create: function(user, data, res) {
            /*
             * Create a new collection
             */

            // console.log('called create...');
            // console.log(data);

            data.author = user;

            // TODO: collections should be unique by name? - 2016-07-19

            db.run(
                "MERGE (u:User {id: {userId}}) " +
                "CREATE (c:Collection { name: {name},  nodes: [], created: timestamp(), modified: timestamp()})<-[:AUTHOR]-(u)  " +
                "return c as collection",
                {
                    userId: user._id.toString(),
                    name: data.name,
                }
            )
            .then((results) => {
                const result = mapIdentity(results.records[0]._fields[0])

                res(null, result)

                // now update ES indexes
                updateCollectionIndex(es, user, result)
                    
            })
            .catch(handleError)
        },

        update: function(user, id, data, res) {
            /*
             * Update properties of collection with id ${id}
             */

            // console.log('called update... ' + id);

            const updatedData = _.pick(data, ['name', 'editorState', 'editorPlainText'])

            // TODO: enforce a structure on ${data} - 2016-07-14
            db.run(
                "MATCH (u:User)--(n:Collection) " +
                "WHERE u.id = {userId} " +
                "AND id(n) = {id} " +
                "SET n = { data } " +
                "SET n.modified = timestamp() " +
                "RETURN n as collection",
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
                updateCollectionIndex(es, user, result)
            })
            .catch(handleError)
        },


        remove: function(user, id, res) {
            /*
             * Permanently delete node with id #{id}
             */

            db.run(
                "MATCH (u:User)--(c:Collection) " +
                "WHERE u.id = {userId} " +
                "AND id(c) = {id} " +
                "DETACH DELETE c",
                {
                    userId: user._id.toString(),
                    id: neo4j.int(id),
                }
            )
            .then(results => {
                res(null, true)

                // now remove document from ES
                removeCollectionDocument(es, id)
            })
            .catch(handleError)
        },

        addNode: function(user, collectionId, nodeId, res) {
            /*
             * Create the edge [collection]-[edge:CONTAINS]->[node], and
             * Create the edge [collection]<-[edge:IN]-[node], and
             * Additionally, update collection relations
             */

            // TODO: Add an edge type argument - 2016-06-06
            // TODO: assert edge type is defined - 2016-04-02
            // TODO: How will we manage this? 2016-04-02

            // console.log('called addNode...');

            if (typeof collectionId === 'string') {
                collectionId = parseInt(collectionId)
            }

            if (typeof nodeId === 'string') {
                nodeId = parseInt(nodeId)
            }

            if (!Number.isInteger(collectionId) || !Number.isInteger(nodeId)) {
                return console.error("Set both node ids")
            }

            db.run(
                "MATCH (u:User)--(c:Collection), (u:User)--(n:Node) " + 
                "WHERE u.id = {userId} " +  
                "AND id(c) = {collectionId} AND id(n) = {nodeId} " +  
                "MERGE (n)-[e:IN]->(c) " +
                "RETURN e as edge, n as node, c as collection",
                {
                    userId: user._id.toString(),
                    collectionId: neo4j.int(collectionId),
                    nodeId: neo4j.int(nodeId),
                }
            )
            .then(results => {
                const edge = mapEdges(results.records[0]._fields[0])
                const node = mapIdentity(results.records[0]._fields[1])
                const collection = mapIdentity(results.records[0]._fields[2])

                // res(null, result)
                res(null, {
                    collection,
                    node,
                })
            })
            .catch(handleError)

                // TODO: update collection edges (if we're doing this) - 2016-04-02
                // db.cypher({
                //     query: 
                //         "MATCH (s:Edge)-[se]->(t:Edge)->(tc:Collection), " +
                //         "(tc:Collection)->(t:Edge)-[te]->(s:Edge), " +
                //         "(c:Collection)" +
                //         "WHERE id(s) = {node_id} AND id(c) = {collection_id} " +
                //         "CREATE (c)-[se]->(tc)" +
                //         "CREATE (tc)-[te]->(c)",
                //         // "RETURN collect(se, tc) as edges",
                // }, function(error, results2) {
                //     console.log(results);
                //     console.log(results2);
                    
                //     res(null, results[0].in)
                // })
        },

        removeNode: function(user, collectionId, nodeId, res) {
            /*
             * Remove node with id #{id} from collection
            */
            // console.log("called removeNode...");

            if (typeof collectionId === 'string') {
                collectionId = parseInt(collectionId)
            }

            if (typeof nodeId === 'string') {
                nodeId = parseInt(nodeId)
            }

            if (!collectionId || !nodeId) {
                return console.error("Set both node ids")
            }

            db.run(
                "MATCH (u:User)--(c:Collection)-[e]-(n:Node)--(u:User) " + 
                "WHERE u.id = {userId} " +  
                "AND id(c) = {collectionId} AND id(n) = {nodeId} " +  
                "DELETE e",
                {
                    userId: user._id.toString(),
                    collectionId: neo4j.int(collectionId),
                    nodeId: neo4j.int(nodeId),
                }
            )
            .then(results => {
                res(null, true)
            })
            .catch(handleError)
        },

        connect: function(user, collection1, collection2, res) {
            /*
             * Create the edge [collection1]-[edge]->[collection2]
             * Additionally, update collection relations
             */

            // TODO: Add an edge type argument - 2016-06-06
            // TODO: assert edge type is defined - 2016-04-02
            // TODO: How will we manage this? 2016-04-02

            // console.log('called connect...');

            if (typeof collection1 === 'string') {
                collection1 = parseInt(collection1)
            }

            if (typeof collection2 === 'string') {
                collection2 = parseInt(collection2)
            }

            if (!typeof collection1 === 'number' || !typeof collection2 === 'number') {
                return res("Set both collection ids")
            }

            if (collection1 === collection2) {
                return res("Self referencing connections are not allowed")
            }

            db.run(
                "MATCH (u:User)--(n1:Collection), (u:User)--(n2:Collection) " +
                "WHERE u.id = {userId} " +
                "AND id(n1) = {collection1} AND id(n2) = {collection2} " +
                "MERGE (n1)-[e:PARENT]->(n2) " +
                "RETURN e as edge",
                {
                    collection1: neo4j.int(collection1),
                    collection2: neo4j.int(collection2),
                    userId: user._id.toString(),
                }
            )
            .then(results => {
                // TODO: only return the edge that was changed 2016-06-08
                const result = mapEdges(results.records[0]._fields[0])

                res(null, result)
            })
            .catch(handleError)
        },

        getCollectionDetailGraph: function(user, id) {
            /*
             * Get the CollectionDetail graph for the collection with id ${id}
            */

            db.run(
                "MATCH (u:User)--(c:Collection)-[]-(n:Node)-[e:EDGE*0..1]-(n2:Node) " +
                // "MATCH (c:Collection)-[]-(n:Node)-[r:EDGE*1..2]-(n2:Node)" +
                // "OPTIONAL MATCH (n:Node)-[IN]->(c:Collection) " +
                "WHERE u.id = {userId} " +
                "AND id(c) = {id} " +
                "RETURN collect(distinct n + n2) as nodes, collect(distinct e) as edges")
            .then((results) => {

                return res(null, {
                    userId: user._id.toString(),
                    nodes: results.records[0]._fields[0].map(mapIdentity),
                    edges: results.records[0]._fields[1].map(mapEdges),
                })
            })
            .catch(handleError)
        },

        removeEdge: function(user, id, res) {
            /*
             * Remove edge with id ${id}
             */

            // console.log("called removeEdge with id " + id);

            db.run(
                "MATCH (u:User)--(:Collection)-[e]->(:Collection)--(u:User) " +
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
             * Full text search for a collection
            */

            // es.search({
            //     index: 'collections',
            //     q: query
            // })
           // .then(body => {
            //    res(null, body.hits.hits)
           // })
            es.search({
                index: 'collections',
                // explain: true,
                body: {
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
                                    "description": {
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
                    // "multi_match": {
                    //     "fields": [ "id", "title^3", "description" ]
                    //     "query": query,
                    //     "fuzziness": "AUTO",
                    // }
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
