'use strict';

exports = module.exports = function(app, mongoose, config) {
  var adminGroupSchema = new mongoose.Schema({
    _id: { type: String },
    name: { type: String, default: '' },
    permissions: [{ name: String, permit: Boolean }]
  });
  adminGroupSchema.plugin(require('./plugins/pagedFind'));
  adminGroupSchema.index({ name: 1 }, { unique: true });
  adminGroupSchema.set('autoIndex', (config.env === 'development'));
  app.db.model('AdminGroup', adminGroupSchema);
  mongoose.model('AdminGroup', adminGroupSchema);
};
