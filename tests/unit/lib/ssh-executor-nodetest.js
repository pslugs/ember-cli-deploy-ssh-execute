var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var SshExecutor = require('../../../lib/ssh-executor');

var FakeSsh2 = function() {
  return {
    failOnConnect: false,
    failOnExec: false,

    connectParams: undefined,
    events: {},
    commands: [],

    on: function(eventName, cb) {
      this.events[eventName] = cb;
    },
    connect: function(config) {
      this.connectParams = config;

      if (this.failOnConnect) {
        this.events.error();
      }
      else {
        this.events.ready();
      }
    },
    end: function() {},
    exec: function(command, cb) {
      this.commands.push(command);
      cb(this.failOnExec);
    },
  };
};

var FakeLog = function() {
  return {
    messages: [],
    errors: [],
    info: function(message) {
      this.messages.push(message);
    },
    error: function(message) {
      this.errors.push(message);
    },
  };
};

describe('ssh-executor', function() {
  describe('#execute', function() {
    var client, log;

    beforeEach(function() {
      client = FakeSsh2();
      log = FakeLog();
    });

    describe('connect to server via ssh2 with the given config', function() {
      it('can connect successfully', function() {
        var config = {host: 'example.org'};
        var subject = new SshExecutor({config, client});

        var promise = subject.execute('ls -al');

        return expect(promise).to.be.fulfilled
          .then(function() {
            expect(client.connectParams).to.equal(config);
          });
      });

      it('handles errors correctly', function() {
        var config = {host: 'example.org'};
        var subject = new SshExecutor({config, client, log});
        client.failOnConnect = true;

        var promise = subject.execute('ls -al');

        return expect(promise).not.to.be.fulfilled
          .then(function() {
            expect(log.errors).to.include('✘ Unable to connect to example.org');
          });
      });
    });

    describe('execute command via ssh2', function() {
      it('can execute command successfully', function() {
        var command = 'some-command --foo';
        var subject = new SshExecutor({client, log});

        var promise = subject.execute(command);

        return expect(promise).to.be.fulfilled
          .then(function() {
            expect(client.commands).to.include(command);
            expect(log.messages).to.include('✔ ' + command);
          });
      });

      it('handles faulty command correctly', function() {
        var command = 'faulty-command';
        var subject = new SshExecutor({client, log});
        client.failOnExec = true;

        var promise = subject.execute(command);

        return expect(promise).not.to.be.fulfilled
          .then(function() {
            expect(client.commands).to.include(command);
            expect(log.errors).to.include('✘ Unable to execute command: ' + command);
          });
      });
    });
  });
});
