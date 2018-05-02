/* @flow */

module.exports = function(db, es) {

    // attaches user object and the socket used
    return function(user, socket) {

        return function fetchAll(id) {
            // TODO: include search and pagination (with offset) - 2018-04-30
            /*
             * Get all sources
             */
            return db.run(`
                MATCH (u:User)--(s:Source)
                WHERE u.id = {userId} AND s.id = {id}
                OPTIONAL MATCH (n)--(a:Annotation)
                RETURN properties(s) as source, collect(properties(a)) as annotations
                `,
                {
                    id,
                    userId: user._id.toString()
                }
            )
                .then((results) => {
                    if (results.records.length === 0) {
                        // TODO: return a proper error object with code etc so they can be handled - 2018-05-01
                        return Promise.reject(`Source with id ${id} was not found`)
                    }

                    let source = results[0].get('sources')
                    const annotations = results.records[0].get('annotations')

                    return Object.assign({},
                        source,
                        { annotations: annotations.map(x => x.id) }
                    )
                })
        }
    }
}
