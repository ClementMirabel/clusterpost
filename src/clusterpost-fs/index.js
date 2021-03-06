exports.register = function (server, conf, next) {

  var _ = require('underscore');
  var fs = require('fs');
  var path = require('path');
  var Boom = require('Boom');

  server.route({
    path: '/dataprovider-fs/{path*}',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
        scope: ['clusterpost', 'executionserver']
      },
      handler: {
        directory: { path: __dirname, listing: false, index: true }
      },
      description: 'This route serves static folder content for clusterpost. Everything inside this folder will be directly accessible under this route.'
    }
  });

  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};