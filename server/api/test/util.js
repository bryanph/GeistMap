const sortBy = require('lodash/sortBy')


const sortById = (x) => sortBy(x, (o) => o.properties.id)
const sortByStart = (x) => sortBy(x, (o) => o.properties.start)

async function getUserGraphData(db, userId) {
    /*
     * Gets the full graph data for the user in JSON format
     */
    const result = await db.run(`
        MATCH (u:User)-[e*]-(n) WHERE u.id = "${userId.toString()}"
        UNWIND e AS edges
        WITH e, edges
        ORDER BY n, edges
        RETURN collect(distinct n), collect(distinct edges)
        `)

    const nodes = result.records[0]._fields[0].map(row => ({
        labels: row.labels,
        properties: row.properties,
    }))
    const edges = result.records[0]._fields[1].map(row => ({
        type: row.type,
        properties: row.properties,
    }))

    return {
        nodes,
        edges,
    }
}

function loadFixtures(db, userId, nodes=[], edges=[]) {
    /*
     * loads JSON
     * accepts an object of nodes and edges
     */
    let nodeInserts = []
    let edgeInserts = []

    // create user
    nodeInserts.push([`CREATE (n:User { id: "${userId}" })`, { id: userId } ])

    nodes.forEach(n => {
        const labelString = n.labels.join(":")
        nodeInserts.push([`
                MATCH (u:User) WHERE u.id = "${userId}"
                CREATE (n:${labelString} { properties })<-[:AUTHOR]-(u)
                `,
            {
                properties: n.properties || {},
            }
        ])
    })

    edges.forEach(e => {
        edgeInserts.push([`
                MATCH (n1)
                WHERE n1.id = "${e.properties.start}"
                WITH n1
                MATCH (n2)
                WHERE n2.id = "${e.properties.end}"
                CREATE (n1)-[e:${e.type} { properties }]->(n2)
                `,
            { properties: e.properties || {} }
        ])
    })

    return db.writeTransaction(tx => {
        return Promise.all([
            ...nodeInserts.map(statement => tx.run(...statement)),
            ...edgeInserts.map(statement => tx.run(...statement))
        ])
    }).catch(e => console.error(e))
}

module.exports = {
    sortById,
    sortByStart,
    getUserGraphData,
    loadFixtures,
}
