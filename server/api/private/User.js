"use strict"

const _ = require('lodash')
const neo4j = require('neo4j-driver').v1

const config = require('../../config/config')
const { print, printTrace } = require('../../utils/dev')

const {
    updateIndex,
    removeNodeDocument,
} = require('../../fulltext')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise; // use ES6 promises

const crypto = require('crypto')


function handleError(error) {
    if (error.stack) {
        console.error(error.stack)
    }
    else {
        console.error(error)
    }
}

module.exports = function(app, db, redisClient, es) {
    /*
     * initialized with
     * db: Neo4j database instance
     * es: Elasticsearch database instance
    */
    const User = app.db.models.User

    console.log(app.db.models);

    return {
        generateMobileUploadToken: function(socket, user, val, res) {
            crypto.randomBytes(48, (err, buffer) => {
                const token = buffer.toString('hex')

                redisClient.hmset(token, {
                    "socketId": socket.id,
                    "userId": user.id
                })
                // expire token after 10 minutes
                redisClient.expire(token, 60 * 10)

                res(null, token)
            })
        }
    }
}
