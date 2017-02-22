'use strict';

const mongoose = require('mongoose')

exports.init = function(req, res, next){
  var sigma = {};
  var collections = ['User', 'Account', 'Admin', 'AdminGroup', 'Category', 'Status'];
  var queries = [];

  collections.forEach(function(el, i, arr) {
    queries.push(function(done) {
      req.app.db.models[el].count({}, function(err, count) {
        if (err) {
          return done(err, null);
        }

        sigma['count'+ el] = count;
        done(null, el);
      });
    });
  });

  var asyncFinally = function(err, results) {
    if (err) {
      return next(err);
    }

    let template = req.app.utils.loadTemplate('admin/index.jade')
    res.write(template(sigma))
    res.end()
  };

  require('async').parallel(queries, asyncFinally);
};
