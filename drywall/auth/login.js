

const mongoose = require('mongoose')
import passport from 'passport'
import workflowMiddleware from './util/workflow'

export function loginView(req, res) {
  if (req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
      let template = req.app.utils.loadTemplate('signup/index.jade')
      res.write(template({
            oauthMessage: '',
            oauthTwitter: !!req.app.config.oauth.twitter.key,
            oauthGitHub: !!req.app.config.oauth.github.key,
            oauthFacebook: !!req.app.config.oauth.facebook.key,
            oauthGoogle: !!req.app.config.oauth.google.key,
            oauthTumblr: !!req.app.config.oauth.tumblr.key
          }))
      res.end()
  }
}

export const login = function(req, res){

  let workflow = workflowMiddleware(req, res)

  workflow.on('validate', function() {

    if (!req.body.username) {
      workflow.outcome.errfor.username = 'required';
    }

    if (!req.body.password) {
      workflow.outcome.errfor.password = 'required';
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('abuseFilter');
  });

  workflow.on('abuseFilter', function() {
    var getIpCount = function(done) {
      var conditions = { ip: req.ip };
      req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
        if (err) {
          return done(err);
        }

        done(null, count);
      });
    };

    var getIpUserCount = function(done) {
      var conditions = { ip: req.ip, user: req.body.username };
      req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
        if (err) {
          return done(err);
        }

        done(null, count);
      });
    };

    var asyncFinally = function(err, results) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (results.ip >= req.app.config.loginAttempts.forIp || results.ipUser >= req.app.config.loginAttempts.forIpAndUser) {
        workflow.outcome.errors.push('You\'ve reached the maximum number of login attempts. Please try again later.');
        return workflow.emit('response');
      }
      else {
        workflow.emit('attemptLogin');
      }
    };

    require('async').parallel({ ip: getIpCount, ipUser: getIpUserCount }, asyncFinally);
  });

  workflow.on('attemptLogin', function() {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (!user) {
        var fieldsToSet = { ip: req.ip, user: req.body.username };
        req.app.db.models.LoginAttempt.create(fieldsToSet, function(err, doc) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.outcome.errors.push('Username and password combination not found or your account is inactive.');
          return workflow.emit('response');
        });
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
}

export const loginTwitter = function(req, res, next){
  passport.authenticate('twitter', function(err, user, info) {
    if (!info || !info.profile) {
      return res.redirect('/login/');
    }

    req.app.db.models.User.findOne({ 'twitter.id': info.profile.id }, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        // TODO: No view, send a response - 2016-04-28
          let template = req.app.utils.loadTemplate('login/index.jade')
          res.write(template({
                    oauthMessage: 'No users found linked to your Twitter account. You may need to create an account first.',
                    oauthTwitter: !!req.app.config.oauth.twitter.key,
                    oauthGitHub: !!req.app.config.oauth.github.key,
                    oauthFacebook: !!req.app.config.oauth.facebook.key,
                    oauthGoogle: !!req.app.config.oauth.google.key,
                    oauthTumblr: !!req.app.config.oauth.tumblr.key
                  }))
          res.end()
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }

          res.redirect(getReturnUrl(req));
        });
      }
    });
  })(req, res, next);
}

export default login
