'use strict';
const Async = require('async');
const promptly = require('promptly');

const config = require('../server/config/config.js')
const authConfig = require('../server/config/auth')
const { setupAuthMiddleware } = require('full-auth-middleware')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise; // use ES6 promises

const db = mongoose.createConnection(config.database.url);
const app = { db } // mock express app object for now...

db.on('error', (error) => console.error('mongoose connection error: ' + error.message));
db.once('open', () => {

    require('full-auth-middleware/schema/Note')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Status')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/StatusLog')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Category')(app, mongoose, authConfig);

    require('full-auth-middleware/schema/User')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Admin')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/AdminGroup')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Account')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/LoginAttempt')(app, mongoose, authConfig);

    Async.auto({
        rootEmail: (done) => {
            promptly.prompt('Admin user email:', done);
        },
        rootPassword: ['rootEmail', (results, done) => {
            promptly.password('Admin user password:', done);
        }],
        checkExists: ['rootEmail', 'rootPassword', (results, done) => {
            db.models.User.findOne({ email: results.rootEmail })
                .exec(function(err, user) {
                    if (user) {
                        if (user.roles.admin) {
                            return done("user with this email is already admin")
                        }

                        // only create the admin and link to the user
                        return done(null, user)
                    }

                    return done(null , false)
                });
        }],
        createRoot: ['rootEmail', 'rootPassword', 'checkExists', (results, done) => {
            Async.auto({
                adminGroup: (done) => {
                    db.models.AdminGroup.findOne({ name: 'Root' }, (err, doc) => {
                        if (!doc) {
                            return db.models.AdminGroup.create({ _id: mongoose.Types.ObjectId(), name: 'Root'}, done)
                        }
                        return done(null, doc)
                    })
                },
                admin: ['adminGroup', (uResults, done) => {
                    const doc = new db.models.Admin({
                        name: {
                            _id: mongoose.Types.ObjectId(),
                            first: 'Root',
                            middle: '',
                            last: 'Admin'
                        },
                        timeCreated: new Date()
                    });

                    return doc.save((error, doc) => {
                        if (error) {
                            return done(error)
                        }
                        
                        done(error, doc)
                    })
                }],
                user: ['adminGroup', (uResults, done) => {
                    if (results.checkExists) {
                        return done(null, results.checkExists)
                    }

                    db.models.User.encryptPassword(results.rootPassword, (error, hash) => {
                        if (error) {
                            return done(error)
                        }


                        const user = new db.models.User({
                            _id: mongoose.Types.ObjectId(),
                            isActive: true,
                            username: results.rootEmail.toLowerCase(),
                            password: hash,
                            email: results.rootEmail.toLowerCase(),
                            timeCreated: new Date()
                        });
                        return user.save((error, doc) => {
                            if (error) {
                                return done(error)
                            }

                            done(error, doc[0])
                        })
                    })
                }],
                adminMembership: ['admin', 'adminGroup', (uResults, done) => {
                    const id = uResults.admin._id.toString();
                    const update = {
                        $set: {
                            groups: [ 'root' ]
                        }
                    };

                    db.models.Admin.findByIdAndUpdate(id, update, done);
                }],
                linkUser: ['admin', 'user', (uResults, done) => {
                    const id = uResults.user._id.toString();
                    const update = {
                        $set: {
                            'roles.admin': uResults.admin._id.toString(),
                        }
                    };

                    db.models.User.findByIdAndUpdate(id, update, done);

                }],
                linkAdmin: ['user', 'admin', (uResults, done) => {
                    const id = uResults.admin._id.toString();
                    const update = {
                        $set: {
                            user: {
                                id: uResults.user._id.toString(),
                                name: 'root'
                            }
                        }
                    };

                    db.models.Admin.findByIdAndUpdate(id, update, done);

                }],

            }, (error, results) => {
                if (error) {
                    console.error('failed to setup user', error);
                    return done(error)
                }

                return done(null, true)
            })
        }]
    }, (error, results) => {
        if (error) {
            console.error('Setup failed.');
            console.error(error);
            return process.exit(1);
        }

        console.log('Setup complete.');
        process.exit(0);
    })
})
