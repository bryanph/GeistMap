

const _ = require('lodash')
const fs = require('fs')
const crypto = require('crypto')
const config = require("../../config/config.js")

const removeFile = function(req, res, next) {
    const fileName = req.body.fileName
    const user = req.user

    if (!fileName) {
        return next(new Error("no filename specified"))
    }

    const file = _.find(user.files, (file) => file.name === fileName)

    if (!file) {
        return next(new Error("filename now owned by user"))
    }

    // TODO: instead, mark for removal => check in x time how many references there are to this file from the nodes. - 2016-11-24
    fs.unlink(file.path)

    const newUserFiles = user.files.filter(file => file.name !== fileName)
    user.files = newUserFiles
    user.save()

    res.end()
}

module.exports = [ removeFile ]

