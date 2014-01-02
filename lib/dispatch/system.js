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
  router = require('../webserver/routes/index');


//joola.dispatch.system.listnodes(function(err,nodes){console.log(err,nodes)})

exports.listnodes = {
  name: "/api/system/listnodes",
  description: "I list all registered nodes",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'system:listnodes'
  },
  run: function (callback) {
    callback = callback || emptyfunc;

    var nodes = [];

    joola.redis.keys('nodes:*', function (err, nodeKeys) {
      if (err)
        return callback(err);

      var expected = nodeKeys.length;
      var counter = 0;
      nodeKeys.forEach(function (node) {
        joola.redis.hgetall(node, function (err, node) {
          nodes.push(node);
          counter++;
          if (counter == expected)
            return callback(err, nodes);
        });
      });
    });
  }
};

exports.roundtrip = {
  name: "/api/system/roundtrip",
  description: "I execute a roundtrip of a payload and return the time in ms",
  inputs: ['start'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'roundtrip'
  },
  _route: null,
  run: function (start, callback) {
    callback = callback || emptyfunc;
    var duration = new Date().getTime() - parseInt(start);
    return callback(null, duration);
  }
};

exports.terminate = {
  name: "/api/system/terminate",
  description: "I terminate a node",
  inputs: ['start'],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'terminate'
  },
  _route: null,
  run: function (uid, callback) {
    callback = callback || emptyfunc;
    if (uid == joola.UID) {
      global.shutdown();
      return callback(null, true);
    }
    return callback(null, false);
  }
};

exports.dummy = {
  name: "/api/system/dummy",
  description: "dummy",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'dummy'
  },
  _route: null,
  run: function (start, callback) {
    callback = callback || emptyfunc;


    //return callback(null, duration);
  }
};

exports.block = {
  name: "/api/system/block",
  description: "block",
  inputs: [],
  _outputExample: {},
  _permission: ['manage_system'],
  _dispatch: {
    message: 'block'
  },
  _route: null,
  run: function (start, callback) {
    callback = callback || emptyfunc;

    console.time('blocking-loop');
    for (var i = 0, len = 500000000; i < len; i++) {
    }
    console.timeEnd('blocking-loop');

    return callback(null, true);
  }
};