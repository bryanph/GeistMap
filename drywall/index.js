
import path from "path"
import fs from "fs"
import express from "express"
import exphbs from 'express-handlebars'
import bodyParser from 'body-parser'
import http from 'http'
import socket_io from "socket.io"
import passportSocketIo from "passport.socketio"
import session from 'express-session'
import cookieParser from 'cookie-parser'
import passport from "passport"
import connect_mongo from "connect-mongo"
import connect_redis from "connect-redis"
import csrf from 'csurf'

export * from './middleware/authentication'

import createAuthRoutes from './routes/auth.js'
import createAdminRoutes from './routes/admin.js'

import { createLoadTemplate } from './util/template'

export default function(app, mongoose, config) {
    /*
     * Set middleware and locals
     * // TODO: from here, config must be initialized and stuff - 2016-08-09
     */

    config.env = process.env.NODE_ENV || "development"

    // Authentication-related models
    require('./schema/Note')(app, mongoose, config);
    require('./schema/Status')(app, mongoose, config);
    require('./schema/StatusLog')(app, mongoose, config);
    require('./schema/Category')(app, mongoose, config);

    require('./schema/User')(app, mongoose, config);
    require('./schema/Admin')(app, mongoose, config);
    require('./schema/AdminGroup')(app, mongoose, config);
    require('./schema/Account')(app, mongoose, config);
    require('./schema/LoginAttempt')(app, mongoose, config);


    // TODO: what if we want this served by nginx or something? - 2016-08-09
    app.use('/static/drywall', express.static(__dirname + '/public'))

    app.use(passport.initialize());
    app.use(passport.session());
    // app.use(csrf());

    //response locals
    app.use(function(req, res, next) {
        req.app = app
        // res.cookie('_csrfToken', req.csrfToken());

        // console.log(req.session)
        // console.log(req.csrfToken());
        // console.log(req.csrfToken());

        // req.session.csrfSecret = req.csrfToken()
        // res.locals.token = req.csrfToken()
        // res.locals.token = req.session.csrfSecret

        res.locals.user = {};
        res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
        res.locals.user.username = req.user && req.user.username;
        next();
    });

    //global locals
    app.locals.projectName = config.projectName;
    app.locals.copyrightYear = new Date().getFullYear();
    app.locals.copyrightName = config.companyName;
    app.locals.cacheBreaker = 'br34k-01';

    // TODO: shouldn't be a global like this - 2016-08-09
    app.config = config
    app.utils = {
        loadTemplate: createLoadTemplate(app),
    }

    // passport.js authentication configuration
    require('./passport')(app, passport, config);

    return {
        authRoutes: createAuthRoutes(app, config),
        adminRoutes: createAdminRoutes(app, config),
    }

}

