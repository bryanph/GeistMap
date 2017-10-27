/*
    Simple Auth
*/
var passport = require('passport')

const { middleware } = require('full-auth-middleware')
const { upload, checkSpace, uploadResponse } = require('./api/private/upload')
const { mobileUploadMiddleware, mobileUploadView } =  require('./api/private/mobileUpload.js')
const config = require('./config/config.js')
const express = require('express')

module.exports = function(app, authRoutes, adminRoutes) {

    /*
     * Main routes
    */

    app.get('/login', (req, res) => {
        res.redirect('/app')
    })

    app.get('/', (req, res) => {
        res.render("landing", {
            port: process.env.NODE_ENV === 'development' ? ':3000' : '',
            fileName: process.env.NODE_ENV === 'development' ? 'landing.bundle.js' : require('../stats.json').assetsByChunkName.landing[0],
            protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https',
            host: req.headers.host.split(":")[0],
            title: "Geist",
            ga: config.ga,
            INITIAL_STATE: JSON.stringify({
                user: req.user,
                serverUiState: req.user && req.user.uiState,
                projectName: req.app.config.projectName,
                version: req.app.config.version,
                oauthMessage: '',
                oauthTwitter: !!req.app.config.oauth.twitter.key,
                oauthGitHub: !!req.app.config.oauth.github.key,
                oauthFacebook: !!req.app.config.oauth.facebook.key,
                oauthGoogle: !!req.app.config.oauth.google.key,
            })
        })
    })

    app.get('/app/?*', middleware.ensureVerified, function(req, res) {
        res.render("app", {
            port: process.env.NODE_ENV === 'development' ? ':3000' : '',
            fileName: process.env.NODE_ENV === 'development' ? 'app.bundle.js' : require('../stats.json').assetsByChunkName.app[0],
            protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https',
            host: req.headers.host.split(":")[0],
            title: "Geist",
            ga: config.ga,
            INITIAL_STATE: JSON.stringify({
                user: req.user,
                serverUiState: req.user.uiState,
            })
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
    app.post('/upload', middleware.ensureVerified, [ upload, checkSpace, uploadResponse ])
    app.post('/upload/remove', middleware.ensureVerified, require('./api/private/removeFile'))

    
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
        console.error('An error occurred!!!')
        console.error(error)
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
