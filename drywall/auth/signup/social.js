

const mongoose = require('mongoose')

import workflowMiddleware from '../util/workflow'
import sendmail from '../util/sendmail'
import path from 'path'

export function signupSocial(req, res, next) {

  let workflow = workflowMiddleware(req, res)

  workflow.on('validate', function() {
    if (!req.body.email) {
      workflow.outcome.errfor.email = 'required';
    }
    else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
      workflow.outcome.errfor.email = 'invalid email format';
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateUsernameCheck');
  });

  workflow.on('duplicateUsernameCheck', function() {
    workflow.username = req.session.socialProfile.username || req.session.socialProfile.id;

    if (!/^[a-zA-Z0-9\-\_]+$/.test(workflow.username)) {
      workflow.username = workflow.username.replace(/[^a-zA-Z0-9\-\_]/g, '');
    }

    req.app.db.models.User.findOne({ username: workflow.username }, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.username = workflow.username + req.session.socialProfile.id;
      }
      else {
        workflow.username = workflow.username;
      }

      workflow.emit('duplicateEmailCheck');
    });
  });

  workflow.on('duplicateEmailCheck', function() {
    req.app.db.models.User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.outcome.errfor.email = 'email already registered';
        return workflow.emit('response');
      }

      workflow.emit('createUser');
    });
  });

  workflow.on('createUser', function() {
    var avatarSocial
    if (req.session.socialProfile.provider == 'twitter') { avatarSocial = req.session.socialProfile._json.profile_image_url_https }
    else if (req.session.socialProfile.provider == 'github') { avatarSocial = req.session.socialProfile._json.avatar_url }
    else if (req.session.socialProfile.provider == 'facebook') { avatarSocial = req.session.socialProfile.photos[0].value }
    else if (req.session.socialProfile.provider == 'google') { avatarSocial = req.session.socialProfile._json.image.url }
    var displayName = req.session.socialProfile.displayName || '';
    var nameParts = displayName.split(' ');
    var fieldsToSet = {
      isActive: 'yes',
      username: workflow.username,
      email: req.body.email.toLowerCase(),
      search: [
        workflow.username,
        req.body.email
      ],
      firstName: nameParts[0],
      lastName: nameParts[1] || '',
      avatar: avatarSocial
    };
    fieldsToSet[req.session.socialProfile.provider] = { id: req.session.socialProfile.id };

    // console.log(req.app.db.models);

    req.app.db.models.User.create(fieldsToSet, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.user = user;
      workflow.emit('createAccount');
    });
  });

  workflow.on('createAccount', function() {
    var displayName = req.session.socialProfile.displayName || '';
    var nameParts = displayName.split(' ');
    var fieldsToSet = {
      isVerified: 'no',
      'name.first': nameParts[0],
      'name.last': nameParts[1] || '',
      'name.full': displayName,
      user: {
        id: workflow.user._id,
        name: workflow.user.username
      },
      search: [
        nameParts[0],
        nameParts[1] || ''
      ],
    };
    req.app.db.models.Account.create(fieldsToSet, function(err, account) {
      if (err) {
        return workflow.emit('exception', err);
      }

      //update user with account
      workflow.user.roles.account = account._id;
      workflow.user.save(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('sendWelcomeEmail');
      });
    });
  });

  workflow.on('sendWelcomeEmail', function() {
    sendmail(req, res, {
      from: req.app.config.smtp.from.name +' <'+ req.app.config.smtp.from.address +'>',
      to: req.body.email,
      subject: 'Your '+ req.app.config.projectName +' Account',
      textPath: 'email/signup-text.jade',
      htmlPath: 'email/signup-html.jade',
      locals: {
        username: workflow.user.username,
        email: req.body.email,
        loginURL: req.protocol +'://'+ req.headers.host +'/login/',
        projectName: req.app.config.projectName
      },
      success: function(message) {
        workflow.emit('logUserIn');
      },
      error: function(err) {
        console.log('Error Sending Welcome Email: '+ err);
        workflow.emit('logUserIn');
      }
    });
  });

  workflow.on('logUserIn', function() {
    req.login(workflow.user, function(err) {
      if (err) {
        return workflow.emit('exception', err);
      }

      delete req.session.socialProfile;
      workflow.outcome.defaultReturnUrl = workflow.user.defaultReturnUrl();
      workflow.emit('response');
    });
  });

  workflow.emit('validate');
};

export function signupTwitter(req, res, next) {
  req._passport.instance.authenticate('twitter', function(err, user, info) {

    if (!info || !info.profile) {
      return res.redirect('/auth/signup/');
    }

    req.app.db.models.User.findOne({ 'twitter.id': info.profile.id }, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        req.session.socialProfile = info.profile;

        res.redirect('/auth/signup/social')

        // res.render('signup/social', { email: '' });
      }
      else {
        // TODO: just redirect to the app - 2016-05-02
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }

          var avatar = info.profile._json.profile_image_url_https

          req.app.db.models.User.findOneAndUpdate({_id: user._id}, {$set: { avatar: avatar }}, { new: true })
            .then(user => {
              res.redirect(req.app.config.appUrl);
            })
            .catch(next)

        });

        // res.render('signup/index', {
        //   oauthMessage: 'We found a user linked to your Twitter account.',
        //   oauthTwitter: !!req.app.config.oauth.twitter.key,
        //   oauthGitHub: !!req.app.config.oauth.github.key,
        //   oauthFacebook: !!req.app.config.oauth.facebook.key,
        //   oauthGoogle: !!req.app.config.oauth.google.key,
        //   oauthTumblr: !!req.app.config.oauth.tumblr.key
        // });
      }
    });
  })(req, res, next);
}

export function signupGoogle(req, res, next) {
  req._passport.instance.authenticate('google', function(err, user, info) {
    if (!info || !info.profile) {
      return res.redirect('/auth/signup/');
    }

    req.app.db.models.User.findOne({ 'google.id': info.profile.id }, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        //req.session.socialProfile = info.profile;
        //res.render('signup/social', { email: info.profile.emails && info.profile.emails[0].value || '' });
        // TODO: get email from Google - 2016-05-04

        req.session.socialProfile = info.profile;
        res.redirect(path.join(
            '/auth/signup/social',
            info.profile.emails && info.profile.emails[0].value || ''
        ))
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }

          var avatar = info.profile._json.image.url
          req.app.db.models.User.findOneAndUpdate(
              {_id: user._id}, 
              {$set: {
                  avatar: avatar 
              }}, { new: true })
            .then(user => {
              res.redirect(req.app.config.appUrl);
            })
            .catch(next)

        });
      }
    });
  })(req, res, next);
};

export function signupGithub(req, res, next) {
  req._passport.instance.authenticate('github', function(err, user, info) {
    if (!info || !info.profile) {
      return res.redirect('/auth/signup/');
    }

    req.app.db.models.User.findOne({ 'github.id': info.profile.id }, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        // req.session.socialProfile = info.profile;
        // res.render('signup/social', { email: info.profile.emails && info.profile.emails[0].value || '' });
        req.session.socialProfile = info.profile;

        res.redirect(path.join(
            '/auth/signup/social',
            info.profile.emails && info.profile.emails[0].value || ''
        ))
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }

          var avatar = info.profile._json.avatar_url
          req.app.db.models.User.findOneAndUpdate({_id: user._id}, {$set: { avatar: avatar }}, { new: true })
            .then(user => {
              res.redirect(req.app.config.appUrl);
            })
            .catch(next)

          res.redirect(req.app.config.appUrl);

        });
      }
    });
  })(req, res, next);
};

export function signupFacebook(req, res, next) {
  req._passport.instance.authenticate('facebook', function(err, user, info) {
    if (!info || !info.profile) {
      return res.redirect('/auth/signup/');
    }

    req.app.db.models.User.findOne({ 'facebook.id': info.profile.id }, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        // TODO: get email from Facebook and use it - 2016-05-04
        req.session.socialProfile = info.profile;
        res.redirect(path.join(
            '/auth/signup/social',
            info.profile.emails && info.profile.emails[0].value || ''
        ))

        // req.session.socialProfile = info.profile;
        // res.render('signup/social', { email: info.profile.emails && info.profile.emails[0].value || '' });
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }

          var avatar = info.profile.photos[0].value
          req.app.db.models.User.findOneAndUpdate({_id: user._id}, {$set: { avatar: avatar }}, { new: true })
            .then(user => {
              res.redirect(req.app.config.appUrl);
            })
            .catch(next)

        });
      }
    });
  })(req, res, next);
};
