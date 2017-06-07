
"use strict"

const _ = require('lodash')
const neo4j = require('neo4j-driver').v1

const config = require('../../config/config')
const { print, printTrace } = require('../../utils/dev')

const {
    updateCollectionIndex,
    removeCollectionDocument,
} = require('../../fulltext')

const uuidV4 = require('uuid/v4');

function handleError(error) {
    console.log(error);
    console.error(error.stack)
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
     * initialize with
     * db: Neo4j database instance
     * es: Elasticsearch database instance
     */

    return {
        // TODO: this method is not in API - 2017-06-04
        createRootCollection: async function(user) {

            const id = uuidV4();

            const results = await db.run(
                "MERGE (u:User {id: {userId}}) " +
                "CREATE (c:Collection:RootCollection { id: {id} name: {name}, isRootCollection: true,  nodes: [], created: timestamp(), modified: timestamp()})<-[:AUTHOR]-(u)  " +
                "return properties(c) as collection",
                {
                    id,
                    userId: user._id.toString(),
                    name: "My Knowledge Base",
                }
            )

            const result = mapIntegers(results.records[0]._fields[0])
        },

        get: function(user, id, res) {
            /*
             * Get node with id ${id} (including its neightbours)
             * // TODO: give this call an explicit name - 2016-07-15
             * // TODO: Check this call's performance - 2016-07-11
             */

            const userId = user._id.toString()

            Promise.all([
                // get collection
                db.run(
                    `MATCH (u:User)--(c:Collection) 
                    WHERE u.id = {userId} AND c.id = {id}
                    RETURN properties(c)`,
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
                    RETURN collect(distinct properties(e))`,
                    {
                        id,
                        userId,
                    }
                ),
                // get all nodes in the collection, along with THEIR collections (ids)
                db.run(
                    `MATCH (u:User)--(c:Collection) 
                    WHERE u.id = {userId} AND c.id = {id}
                    OPTIONAL MATCH (c)<-[*0..]-(:Collection)--(n:Node)
                    WITH distinct n
                    OPTIONAL MATCH (n)-[:IN]-(c:Collection)-[:PARENT*0..]->(c2:Collection) // get collections for node
                    RETURN properties(n), collect(distinct c2.id)`,
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

                    const collection = mapIntegers(results[0].records[0].get(0))
                    const edges = results[1].records[0].get(0).map(mapIntegers)

                    const nodes = results[2].records[0].get(0) === null ?
                        [] : 
                        results[2].records.map(row => (
                            Object.assign({},
                                mapIntegers(row.get(0)),
                                {
                                    collections: row.get(1).map(mapIntegers), // ids for collections
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

        getAll: function(user, res) {
            /*
             * Get all collections and their relationships
             * TODO: 2016-08-11 - These relationships define hierarchies
             */

            // TODO: Explicit relations (between collections) - 2016-07-11
            // TODO: Implicit relations (between two nodes in collections - 2016-07-11
            // TODO: Separate explicit and implicit relations? - 2016-04-02
            // TODO: Separate explicit and implicit relations? - 2016-04-02

            Promise.all([
                // get all the edges between the collections
                db.run(
                    "MATCH (u:User)--(c:Collection) " +
                    "WHERE u.id = {userId} " +
                    "WITH collect(c) as c2 " +
                    "UNWIND c2 as cu1 " +
                    "UNWIND c2 as cu2 " +
                    "MATCH (cu1)-[e:PARENT]->(cu2) " +
                    "RETURN collect(properties(e))",
                    {
                        userId: user._id.toString()
                    }
                ),
                db.run(
                    "MATCH (u:User)--(c:Collection) " +
                    "WHERE u.id = {userId} " +
                    "OPTIONAL MATCH (c)<-[:PARENT*0..5]-(c2:Collection) " +
                    "OPTIONAL MATCH (c2)--(n:Node) " +
                    "RETURN properties(c), count(n)",
                    {
                        userId: user._id.toString()
                    }
                )
            ]).then((results) => {
                const edges = results[0].records[0]._fields[0]
                const collections = results[1].records.map(row => (
                    Object.assign({},
                        mapIntegers(row.get(0)),
                        {
                            count: row.get(1).toNumber()
                        }
                    )
                ))

                console.log(edges);
                console.log(collections);

                return res(null, {
                    collections,
                    edges
                })
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

        create: function(user, id, data, res) {
            /*
             * Create a new collection
             */

            data.author = user;

            // TODO: collections should be unique by name? - 2016-07-19

            db.run(
                "MERGE (u:User {id: {userId}}) " +
                "CREATE (c:Collection { id: {id} name: {name},  nodes: [], created: timestamp(), modified: timestamp()})<-[:AUTHOR]-(u)  " +
                "return properties(c) as collection",
                {
                    userId: user._id.toString(),
                    name: data.name,
                }
            )
                .then((results) => {
                    const result = mapIntegers(results.records[0]._fields[0])

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

            const updatedData = _.pick(data, ['name', 'editorState', 'editorPlainText'])

            // TODO: enforce a structure on ${data} - 2016-07-14
            db.run(
                "MATCH (u:User)--(n:Collection) " +
                "WHERE u.id = {userId} " +
                "AND n.id = {id} " +
                "SET n = { data } " +
                "SET n.modified = timestamp() " +
                "RETURN properties(n) as collection",
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
                "WHERE NOT c:RootCollection AND u.id = {userId} " +
                "AND c.id = {id} " +
                "DETACH DELETE c",
                {
                    userId: user._id.toString(),
                    id,
                }
            )
                .then(results => {
                    res(null, true)

                    // now remove document from ES
                    removeCollectionDocument(es, id)
                })
                .catch(handleError)
        },

        addNode: function(user, collectionId, nodeId, id, res) {
            /*
             * Create the edge [collection]-[edge:CONTAINS]->[node], and
             * Create the edge [collection]<-[edge:IN]-[node], and
             * Additionally, update collection relations
             */

            // TODO: Add an edge type argument - 2016-06-06
            // TODO: assert edge type is defined - 2016-04-02
            // TODO: How will we manage this? 2016-04-02

            if (!collectionId || !nodeId) {
                return res("Set both node ids")
            }

            db.run(
                "MATCH (u:User)--(c:Collection), (u:User)--(n:Node) " + 
                "WHERE u.id = {userId} " +  
                "AND c.id = {collectionId} AND n.id = {nodeId} " +  
                "MERGE (n)-[e:IN { id: {id} }]->(c) " +
                "RETURN properties(e) as edge, properties(n) as node, properties(c) as collection",
                {
                    id,
                    userId: user._id.toString(),
                    collectionId,
                    nodeId,
                }
            )
                .then(results => {
                    const edge = results.records[0]._fields[0]
                    const node = mapIntegers(results.records[0]._fields[1])
                    const collection = mapIntegers(results.records[0]._fields[2])

                    // res(null, result)
                    res(null, {
                        collection,
                        node,
                    })
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

            db.run(
                "MATCH (u:User)--(c:Collection)-[e]-(n:Node)--(u:User) " + 
                "WHERE u.id = {userId} " +  
                "AND c.id = {collectionId} AND n.id = {nodeId} " +  
                "DELETE e",
                {
                    userId: user._id.toString(),
                    collectionId,
                    nodeId,
                }
            )
                .then(results => {
                    res(null, true)
                })
                .catch(handleError)
        },

        connect: function(user, collection1, collection2, id, res) {
            /*
             * Create the edge [collection1]-[edge]->[collection2]
             * Additionally, update collection relations
             */

            // TODO: Add an edge type argument - 2016-06-06
            // TODO: assert edge type is defined - 2016-04-02
            // TODO: How will we manage this? 2016-04-02

            if (!collection1 || !collection2) {
                return res("Set both collection ids")
            }

            if (collection1 === collection2) {
                return res("Self referencing connections are not allowed")
            }

            db.run(
                "MATCH (u:User)--(n1:Collection), (u:User)--(n2:Collection) " +
                "WHERE u.id = {userId} " +
                "AND n1.id = {collection1} AND n2.id = {collection2} " +
                "MERGE (n1)-[e:PARENT { id: {id} }]->(n2) " +
                "RETURN properties(e) as edge",
                {
                    id,
                    collection1,
                    collection2,
                    userId: user._id.toString(),
                }
            )
                .then(results => {
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
                "MATCH (u:User)--(:Collection)-[e]->(:Collection)--(u:User) " +
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
                index: config.es.collectionIndex,
                // explain: true,
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
