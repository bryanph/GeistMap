'use strict';

exports = module.exports = function(app, mongoose, config) {
  var attemptSchema = new mongoose.Schema({
    ip: { type: String, default: '' },
    user: { type: String, default: '' },
    time: { type: Date, default: Date.now, expires: config.loginAttempts.logExpiration }
  });
  attemptSchema.index({ ip: 1 });
  attemptSchema.index({ user: 1 });
  attemptSchema.set('autoIndex', (config.env === 'development'));
  app.db.model('LoginAttempt', attemptSchema);
  // mongoose.model('LoginAttempt', attemptSchema);
};
