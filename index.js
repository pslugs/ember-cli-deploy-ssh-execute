'use strict';

var Plugin = require('./lib/plugin');

module.exports = {
  name: 'ember-cli-deploy-ssh-execute',

  createDeployPlugin: function(options) {
    var DeployPlugin = Plugin.extend({
      name: options.name,
    });

    return new DeployPlugin();
  },
};
