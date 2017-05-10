
const fs = require('fs')
const crypto = require('crypto')
const config = require("../../config/config.js")
const io = require('socket.io')

const multer = require('multer');

const { upload, checkSpace, uploadResponse } = require('./upload')

function checkMobileToken(req, res, next) {
    const redisClient = req.redisClient

    const token = req.params.token

    if (!token) {
        return next({
            "message": `no token passed`
        })
    }

    redisClient.hgetall(token, (error, reply) => {
        if (error) {
            console.error(error);
            return next({
                "message": `internal error occurred, please contact administrator`
            })
        }

        // token not found
        if (!reply) {
            return next({
                "message": `Invalid token or expired`
            })
        }

        const socket = req.io.sockets.connected[reply.socketId] 
        if (!socket) {
            return next({
                "message": `You must stay connected in the browser to upload`
            })
        }

        req.notifySocket = socket

        // need to attach user object here
        req.app.db.models.User.findOne({ _id: reply.userId }, { password: 0 })
            .exec(function(err, user) {
                if (!user) {
                    return next({
                        "message": `User not found`
                    })
                }

                req.user = user
                next()
            })

    })
}

function notifyUser(req, res, next) {
    // notify the original user of the uploaded file

    const files = req.files;
    const socket = req.notifySocket
    const user = req.user

    const fileObjects = files.map(function(file){
        return {
            encoding: file.encoding,
            filename: file.filename,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            url: '/media/uploads/'+file.filename
        }
    })

    console.log(fileObjects);
    console.log("notifying user...");

    socket.emit('mobileUpload', fileObjects, (ack) => {
        console.log("got ack!", ack);
        if (!ack) {
            // remove all files
            files.forEach((file) => {
                fs.unlink(file.path);
            })

            return next({
                "message": `Failed to notify browser`
            })
        }

        // clean up: remove the token from redis
        const token = req.params.token
        req.redisClient.del(token)

        next()
    })
    
}

exports.mobileUploadMiddleware = [ checkMobileToken, upload, checkSpace, notifyUser, uploadResponse ]

exports.mobileUploadView = (req, res) => {
    return res.render("mobileUpload/index", {
        token: req.params.token
    })
}

