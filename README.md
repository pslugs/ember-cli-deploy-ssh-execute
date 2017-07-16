# ember-cli-deploy-ssh-execute

[![Build Status](https://travis-ci.org/felixkiss/ember-cli-deploy-ssh-execute.svg?branch=master)](https://travis-ci.org/felixkiss/ember-cli-deploy-ssh-execute)

This plugin can be used to execute commands on a SSH server after a successful
deploy. It will trigger the defined commands in the
[`didActivate` hook](http://ember-cli-deploy.com/docs/v1.0.x/pipeline-hooks/).

## Installation

```
ember install ember-cli-deploy-ssh-execute
```

## Configuration

Add commands in your `config/deploy.js`:

```js
module.exports = function(deployTarget) {
  var ENV = {
    // ...
    'ssh-execute': {
      host: 'example.org',
      port: 22,
      username: 'deploy',
      remoteDir: '/some/path/on/the/server',
      commands: [
        './my-command.sh foo bar',
      ],
    },
    // ...
  };
};
```

The following configuration options are available:

Required:
 - host
 - username
 - commands

Optional:
 - port
 - remoteDir
 - privateKey
 - passphrase
 - agent

## Contributing

 - Add the necessary tests for the change
 - Implement the change
 - Run the tests via

```
npm test
```

## License

MIT
