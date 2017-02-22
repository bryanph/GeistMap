
import _ from 'lodash'
import fs from 'fs'
import crypto from 'crypto'
import config from "../../config/config.js"

const multer = require('multer');


export const checkSpace = function(req, res, next) {
    const user = req.user
    const files = req.files;

    const usedSpace = (user.files || []).reduce((acc, file) => acc + file.size, 0)
    const requiredSpace = files.reduce((acc, file) => acc + file.size, 0)

    if ((usedSpace + requiredSpace) > config.uploadLimit) {
        fs.unlink(req.files[0].path)

        return next({
            "message": `reached upload limit of ${config.uploadLimit / Math.pow(2,20)}MB`
        })
    }

    next()
}


var storage = multer.diskStorage({
    destination: function (req, file, callback) {

        callback(null, config.uploadDir);
    },
    filename: function (req, file, callback) {
        // TODO: create a directory for the user (hashed of userId) - 2016-11-23

        const input = file.originalname + Date.now()

        const shasum = crypto.createHash('sha256')
        shasum.update(input)

        callback(null, shasum.digest('hex'));
    }
});

const filterFiles = (req, file, cb) => {
    /*
     * Don't accept all kinds of files...
     */

    cb(null, true)
}

export const upload = multer({
    storage : storage,
    limits: {
        fields: 10,
        files: 1,
        fileSize: 100000000, // in bytes (100 MB)
    },
    fileFilter: filterFiles,
}).array('files', 1);

// TODO: make files private for user - 2016-06-26
export const uploadResponse = function(req, res) {
    const files = req.files;
    const user = req.user

    // remove file after 1 hour
    // setTimeout(function(){
    //   req.files.forEach(function(file){
    //     fs.unlink(file.path, function(err) {});
    //   })
    // }, 1*60000);

    const fileObjects = files.map( function(file){
        return {
            encoding: file.encoding,
            filename: file.filename,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            url: '/media/uploads/'+file.filename,
            owner: user._id,
        }
    })

    req.app.db.models.File.insertMany(fileObjects, function(err, files) {
        if (!user.files) {
            user.files = []
        }
        _.forEach(files, (file => user.files.push(file._id)))

        user.markModified('files')
        user.save()

        res.json({
            success: true,
            files: fileObjects,
        });
    })

    // TODO: Compress files here? - 2017-02-08

}

export default [ upload, checkSpace, uploadResponse ]

