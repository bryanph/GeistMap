/* @flow */

module.exports = function(db, es) {

    // attaches user object and the socket used
    return function(user, socket) {

        return function fetchAll(action) {
            // TODO: include search and pagination (with offset) - 2018-04-30
            /*
             * Get all sources
             */
            db.run(`
                MATCH (u:User)--(s:Source)
                WHERE u.id = {userId} AND s.id = {id}
                OPTIONAL MATCH (n)--(a:Annotation)
                RETURN properties(s) as sources, collect(properties(a)) as annotations
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

                    console.log(results)

                    let sources = results[0].get('sources')

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
        }
    }
}
