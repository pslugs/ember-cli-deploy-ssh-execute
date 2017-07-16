var BasePlugin = require('ember-cli-deploy-plugin');
var SshExecutor = require('./ssh-executor');

module.exports = BasePlugin.extend({
  defaultConfig: {
    port: 22,
  },
  requiredConfig: ['host', 'username', 'commands'],

  executor: null,

  configure: function() {
    this._super.configure.apply(this, arguments);

    if (this.executor) {
      return;
    }

    var that = this;
    this.executor = new SshExecutor({
      config: this.sshConfig(),
      log: {
        info: function(message) {
          that.log(message);
        },
        error: function(message) {
          that.log(message);
        },
      },
    });
  },

  didActivate: function() {
    var remoteDir = this.readConfig('remoteDir');
    var commands = this.readConfig('commands');
    var executor = this.executor;

    return Promise.all(commands.map(function(command) {
      if (remoteDir) {
        command = 'cd ' + remoteDir + ' && ' + command;
      }
      return executor.execute(command);
    }));
  },

  sshConfig: function() {
    return {
      host: this.readConfig('host'),
      username: this.readConfig('username'),
      port: this.readConfig('port'),
      agent: this.readConfig('agent'),
      passphrase: this.readConfig('passphrase'),
      privateKey: this.readConfig('privateKey'),
    };
  },
});
