var
  joola = require('../../../joola.io'),
  _ = require('underscore'),
  ce = require('cloneextend');

var mongo = module.exports = exports;

mongo.verify = function (context, collection, documents, callback) {
  var _document;
  if (!Array.isArray(documents))
    documents = [documents];

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  joola.dispatch.collections.metadata(context, context.user.organization, _document, null, function (err, meta) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    joola.dispatch.collections.get(context, context.user.organization, collection, function (err, _collection) {
      if (err) {
        meta.id = collection;
        meta.name = collection;

        joola.dispatch.collections.add(context, context.user.organization, meta, function (err, _collection) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          return callback(null);
        });
      }
      else {
        joola.dispatch.collections.metadata(context, context.user.organization, _document, collection, function (err, _meta) {
          /* istanbul ignore if */
          if (err)
            return callback(err);

          var match = equal(meta, _meta);
          if (!match) {
            meta.id = collection;
            meta.name = collection;


            joola.dispatch.collections.update(context, context.user.organization, meta, function (err) {
              joola.logger.debug('Updating collection [' + collection + '] due to meta change.');
              return callback(null);
            });
          }
          else {
            return callback(null);
          }
        });
      }
    });
  });
};

mongo.furnish = function (context, collection, documents, callback) {
  var bucket = {};

  if (!Array.isArray(documents))
    documents = [documents];

  var _document;

  if (documents.length > 0)
    _document = ce.clone(documents[0]);

  joola.dispatch.collections.metadata(context, context.user.organization, _document, collection, function (err, meta) {
    /* istanbul ignore if */
    if (err)
      return callback(err);

    var dimensions = [];
    var dateDimensions = [];
    Object.keys(meta).forEach(function (key) {
      var elem = meta[key];

      if (elem.datatype === 'date' && elem.key !== 'ourTimestamp')
        dateDimensions.push(elem);
      if (elem.type === 'dimension')
        dimensions.push(elem);
    });

    documents.forEach(function (document, index) {
      dateDimensions.forEach(function (dateDimension) {
        var _dimension = joola.common.extend({}, dateDimension);
        //if (dateDimension.mapto)
        //dateDimension = joola.config.datamap.dimensions[dateDimension.mapto];

        if (document[_dimension.key] === null) {
          document[_dimension.key] = new Date().getTime();
        }
        var _date = new Date(document[_dimension.key]);
        bucket.dow = new Date(_date).getDay();
        bucket.hod = new Date(_date).getHours();
        _date.setMilliseconds(0);
        bucket.second = new Date(_date);
        _date.setSeconds(0);
        bucket.minute = new Date(_date);
        _date.setMinutes(0);
        bucket.hour = new Date(_date);
        _date.setUTCHours(0, 0, 0, 0);
        bucket.date = new Date(_date);
        _date.setDate(1);
        bucket.month = new Date(_date);
        _date.setMonth(0);
        bucket.year = new Date(_date);

        document[dateDimension.key + '_timebucket'] = bucket;
        document[dateDimension.key] = new Date(document[_dimension.key]);//bucket.second;
      });
      document.ourTimestamp = new Date();

      var documentKey = {};
      dimensions.forEach(function (key) {
        //var d = collection.dimensions[key];
        documentKey[key] = document[key];
      });
      if (collection.unique)
        document._key = joola.common.hash(JSON.stringify(documentKey).toString());
      else
        document._key = joola.common.uuid();
      documents[index] = document;
    });


    return callback(null, collection);
  });
};

mongo.load = function (context, collection, documents, options, callback) {
  if (!Array.isArray(documents))
    documents = [documents];

  //mongo.verify(context, collection, documents, function (err) {
 //   if (err)
  //    return callback(err);

    mongo.furnish(context, collection, documents, function (err) {
      /* istanbul ignore if */
      if (err)
        return callback(err);

      joola.mongo.insert('cache', context.user.organization + '_' + collection, documents, options, function (err) {
        return callback(err, documents);
      });
  //  });
  });
};