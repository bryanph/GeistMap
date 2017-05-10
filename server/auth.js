const passport = require('passport')
const Account = require('./models/Account')
const config = require('./config/config')

var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new LocalStrategy(Account.authenticate()));

passport.use(new TwitterStrategy(config.auth.twitter,
  function(token, tokenSecret, profile, done) {
    Account.findOne({oauthID: profile.id}, function(error, user) {
      if (error) return done(error)
      if (user) return done(error, user);

      user = new Account
      user.oauthID = profile.id
      user.name = profile.displayName

      // TODO: Store more info from user - 2016-01-27

      // user.name = profile.username
      // user.description = profile._json.description
      // user.url = profile._json.url

      // user.access_token = token
      // user.access_token_secret = tokenSecret

      user.save((error) => done(error, user))
    })
}));

passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(function(user, done) {
  // console.log("serializing user:", user._id)
  done(null, user);
})
passport.deserializeUser(function(obj, done) {
  done(null, obj);
})

