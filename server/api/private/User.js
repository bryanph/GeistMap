"use strict"

import DatabaseContainer from '../../utils/DatabaseContainer'
import _ from 'lodash'
const neo4j = require('neo4j-driver').v1

import config from '../../config/config'
import { print, printTrace } from '../../utils/dev'

import {
    updateIndex,
    removeNodeDocument,
} from '../../fulltext'

import mongoose from 'mongoose'
mongoose.Promise = global.Promise; // use ES6 promises
import crypto from 'crypto'


function handleError(error) {
    if (error.stack) {
        console.error(error.stack)
    }
    else {
        console.error(error)
    }
}

export default function(app, db, redisClient, es) {
    /*
     * initialized with
     * db: Neo4j database instance
     * es: Elasticsearch database instance
    */
    const User = app.db.models.User

    return {
        updateUi: function(user, uiState, res) {
            console.log('called updateUi');
            console.log(uiState);

            return User
                .findOneAndUpdate({_id: user._id}, {$set: { uiState: uiState }}, { new: true })
                .exec()
                .then(acc => {
                    res(null, acc)
                })
                .catch((error) => {
                    console.error(error.stack);
                    res(error)
                })
        },

        generateMobileUploadToken: function(socket, user, val, res) {
            crypto.randomBytes(48, (err, buffer) => {
                const token = buffer.toString('hex')

                redisClient.hmset(token, {
                    "socketId": socket.id,
                    "userId": user.id
                })
                // expire token after 10 minutes
                redisClient.expire(token, 60 * 10)

                console.log("generated token", token, socket.id, user.id);

                res(null, token)
            })
        }
    }
}
