var
  joola = require('../../../joola.io'),
  
  _ = require('underscore'),
  djson = require('describe-json'),
  kdb = require('kairosdb');

var kairosdb = module.exports = exports;

kairosdb.parse = function (documents) {
  var parsedDocuments = [];
  if (!Array.isArray(documents))
    documents = [documents];
  documents.forEach(function (document) {
    var subDocuments = [];
    var flatten = djson.flatten(document);
    var metrics = _.filter(flatten, function (f) {
      return f[2] === 'number';
    });

    var stencil = {
      timestamp: null,
      tags: {
      }
    };
    flatten.forEach(function (attribute) {
      var key = attribute[0];
      var value = attribute[1];
      var datatype = attribute[2];

      switch (datatype) {
        case 'date':
          stencil.timestamp = value.getTime();
          break;
        case 'string':
          stencil.tags[key] = value;
          break;
        default:
          break;
      }
    });
    if (!stencil.timestamp)
      stencil.timestamp = new Date().getTime();
    metrics.forEach(function (metric) {
      var _result = joola.common.extend({name: metric[0], value: metric[1]}, stencil);
      subDocuments.push(_result);
    });
    parsedDocuments = parsedDocuments.concat(subDocuments);
  });

  return parsedDocuments;
};

kairosdb.load = function (context, collection, documents, options, callback) {
  var parsedDocuments = kairosdb.parse(documents);

  var namespace = context.user.organization + '_' + collection;

  joola.config.get('store:cache:kairosdb', function (err, options) {
    var client = kdb.init(options.host, options.port, {debug: false});
    var expected = 0;

    parsedDocuments.forEach(function (document, i) {
      expected++;

      document.name = namespace + document.name;
      document.tags.__namespace = namespace;

      client.datapoints(document, function (err) {
        expected--;
        document.err = !!err;
        parsedDocuments[i] = document;
        if (expected === 0)
          return callback(null, parsedDocuments);
      });
    });
  });
};