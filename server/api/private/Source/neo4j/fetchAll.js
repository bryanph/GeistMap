/* @flow */

module.exports = function(db, es) {

    // attaches user object and the socket used
    return function(user, socket) {

        return function fetchAll() {
            // TODO: include search and pagination (with offset) - 2018-04-30
            /*
             * Get all sources
             */
            return db.run(`
                MATCH (u:User)--(s:Source)
                WHERE u.id = {userId}
                OPTIONAL MATCH (s)--(a:Annotation)
                RETURN properties(s) as sources, collect(properties(a)) as annotations
                `,
                {
                    userId: user._id.toString()
                }
            )
                .then((results) => {
                    console.log(results.records)
                    return results.records.map(record => (
                        record.get('sources')
                    ))
                })
        }
    }
}
