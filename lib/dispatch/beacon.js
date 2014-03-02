/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/



var
  joola = require('../joola.io'),

  router = require('../webserver/routes/index'),
  equal = require('deep-equal'),
  ce = require('cloneextend'),
  path = require('path'),
  _ = require('underscore'),
  fs = require('fs');

var etl = {};
exports.etl = etl;

exports.insert = {
  name: "/api/beacon/insert",
  description: "",
  inputs: ['collection', 'document'],
  _outputExample: {},
  _permission: ['beacon_insert'],
  _dispatch: {
    message: 'beacon:insert'
  },
  _route: function (req, res) {
    var _params = {};
    Object.keys(req.params).forEach(function (p) {
      if (p != 'resource' && p != 'action')
        _params[p] = req.params[p];
    });

    if (typeof _params.document === 'string') {
      try {
        _params.document = JSON.parse(_params.document);
      }
      catch (ex) {
        return router.responseError(new router.ErrorTemplate('Document must be a valid JSON'), req, res);
      }
    }
    var context = {};
    context.user = req.user;
    try {
      exports.insert.run(context, _params.collection, _params.document, function (err, result) {
        /* istanbul ignore if*/
        if (err)
          return router.responseError(new router.ErrorTemplate('Failed to route action [' + 'fetch' + ']: ' + (typeof(err) === 'object' ? err.message : err)), req, res);

        return router.responseSuccess(result, req, res);
      });
    }
    catch (ex) {
      /* istanbul ignore next */
      return router.responseError(new router.ErrorTemplate(ex), req, res);
    }
  },
  run: function (context, collection, document, callback) {
    callback = callback || emptyfunc;
    try {
      joola.config.get('store:cache', function (err, stores) {
        if (!stores)
          return callback(null);

        var expected = stores.length;
        Object.keys(stores).forEach(function (storename) {
          var provider = require(path.join(__dirname, './providers/caching/' + storename));
          try {
            provider.load(context, collection, document, {}, function (err, documents) {
              expected--;
              //if (err)
              //  return callback(err);

              if (expected === 0) {
                return callback(null, documents);
              }
            });
          }
          catch (ex) {
            console.log(ex)
            console.log(ex.stack)
          }
        });
      });
    }
    catch (ex) {
      /* istanbul ignore next */
      console.log('exception', ex);
      /* istanbul ignore next */
      console.log(ex.stack);
    }
  }
};



