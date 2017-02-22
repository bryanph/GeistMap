/*
    Simple Auth
*/
var passport = require('passport')

import { authFlow, ensureVerified, ensureAccount } from '../drywall/index.js'
import uploadMiddleware from './api/private/upload'
import { mobileUploadMiddleware, mobileUploadView } from './api/private/mobileUpload.js'
import config from "./config/config.js"
import express from "express"

// TODO: Separate routes into files - 2016-03-21
module.exports = function(app, authRoutes, adminRoutes) {

    /*
     * Main routes
    */

    // app.get('/', (req, res) => {
    //     res.redirect('/app')
    // })

    app.get('/', (req, res) => {
        res.render("landing", {
            protocol: req.protocol,
            host: req.headers.host.split(":")[0],
            title: "GraphTodo",
            INITIAL_STATE: {
                user: req.user, // TODO: Secure this - 2016-01-25
                serverUiState: req.user && req.user.uiState,
                projectName: req.app.config.projectName,
                version: req.app.config.version,
                oauthMessage: '',
                oauthTwitter: !!req.app.config.oauth.twitter.key,
                oauthGitHub: !!req.app.config.oauth.github.key,
                oauthFacebook: !!req.app.config.oauth.facebook.key,
                oauthGoogle: !!req.app.config.oauth.google.key,
                oauthTumblr: !!req.app.config.oauth.tumblr.key
            }
        })
    })

    app.get('/app/?*', ensureVerified, function(req, res) {
        res.render("app", {
            protocol: req.protocol,
            host: req.headers.host.split(":")[0],
            title: "GraphTodo",
            INITIAL_STATE: {
                user: req.user, // TODO: Secure this - 2016-01-25
                serverUiState: req.user.uiState,
            }
        })
    })

    /*
     * Authentication (based on drywall)
    */
    app.use('/auth', authRoutes)

    /*
     * Admin section (based on drywall)
    */
    app.use('/admin', adminRoutes)

    /*
     * Upload
    */
    app.post('/upload', ensureVerified, uploadMiddleware)
    app.post('/upload/remove', ensureVerified, require('./api/private/removeFile'))

    
    app.get('/upload/mobile/video/:token', function(req, res) {
        return res.render("mobileUpload/index", {
            token: req.params.token,
            fileType: 'video',
            capture: 'camcorder',
        })
    })

    app.post('/upload/mobile/video/:token', mobileUploadMiddleware)

    app.get('/upload/mobile/photo/:token', function(req, res) {
        return res.render("mobileUpload/index", {
            token: req.params.token,
            fileType: 'image',
            capture: 'camera',
        })
    })
    app.post('/upload/mobile/photo/:token', mobileUploadMiddleware)

    app.get('/upload/mobile/audio/:token', function(req, res) {
        return res.render("mobileUpload/index", {
            token: req.params.token,
            fileType: 'audio',
            capture: 'microphone',
        })
    })
    app.post('/upload/mobile/audio/:token', mobileUploadMiddleware)

    /*
     * Public API
    */
    app.get('/api', function(req, res) {
        console.log('called api route');
    })

    app.use('/media/uploads/:filename', function(req, res, next) {
        // check if file is owned by the logged in user
        // TODO: what if node is public? - 2016-12-04
        const filename = req.params.filename

        req.app.db.models.File.findOne({ filename })
            .populate('owner')
            .exec((error, file) => {
                if (error) {
                    return next(error)
                }
                if (!file) {
                    return next({
                        "message": "file not found",
                        "code": 404,
                    })
                }

                if (!req.user || !req.user._id.equals(file.owner._id)) {
                    return next({
                        "message": "Not authorized",
                        "code": 401,
                    })
                }

                next()
            })
    })

    app.use('/media', express.static(config.media_root))

    if (config.env === "development") {
        app.use('/static', express.static(config.static_root))
    }

    // error handling
    app.use(function(error, req, res, next) {
        if (error instanceof Error) {
            return res.status(500).send({
                status: 500,
                error: error,
            })
        }

        const status = error.code ? error.code : 500

        return res.status(status).send({
            status,
            error: error,
        })
    })
}
