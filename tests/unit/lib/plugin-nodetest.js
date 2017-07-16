var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var Plugin = require('../../../lib/plugin');

var FakeUi = function() {
  return {
    messages: [],
    write: function() {},
    writeLine: function(message) {
      this.messages.push(message);
    },
  };
};

var FakeExecutor = function() {
  return {
    commands: [],
    promise: Promise.resolve,
    execute: function(command) {
      this.commands.push(command);
      return this.promise;
    },
  };
};

describe('ember-cli-deploy-ssh-execute', function() {
  var context, fakeUi;

  beforeEach(function() {
    context = {
      name: 'ember-cli-deploy-ssh-execute',
      ui: fakeUi = FakeUi(),
      executor: FakeExecutor(),
      config: {},
    };
  });

  describe('configuration', function() {
    it('requires host', function() {
      var plugin = new Plugin(context);

      expect(plugin.requiredConfig).to.include('host');
    });

    it('requires username', function() {
      var plugin = new Plugin(context);

      expect(plugin.requiredConfig).to.include('username');
    });

    it('requires commands', function() {
      var plugin = new Plugin(context);

      expect(plugin.requiredConfig).to.include('commands');
    });

    it('provides default port', function() {
      var plugin = new Plugin(context);

      expect(plugin.defaultConfig.port).to.equal(22);
    });
  });

  describe('#didDeploy', function() {
    it('delegates to ssh-executor for every command', function() {
      context.config['ember-cli-deploy-ssh-execute'] = {
        host: 'example.org',
        username: 'deploy',
        commands: [
          'some-command',
          'other-command',
        ],
      };
      var plugin = new Plugin(context);
      plugin.beforeHook(context);
      plugin.configure();

      var promise = plugin.didDeploy(context);

      return expect(promise).to.be.fulfilled
        .then(function() {
          expect(plugin.executor.commands).to.include('some-command');
          expect(plugin.executor.commands).to.include('other-command');
        });
    });

    it('changes directory if remoteDir is specified', function() {
      context.config['ember-cli-deploy-ssh-execute'] = {
        host: 'example.org',
        username: 'deploy',
        remoteDir: '/foo/bar',
        commands: [
          'some-command',
        ],
      };
      var plugin = new Plugin(context);
      plugin.beforeHook(context);
      plugin.configure();

      var promise = plugin.didDeploy(context);

      return expect(promise).to.be.fulfilled
        .then(function() {
          expect(plugin.executor.commands).to.include('cd /foo/bar && some-command');
        });
    });
  });
});
