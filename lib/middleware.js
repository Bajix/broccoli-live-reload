var middleware = require('broccoli/lib/middleware'),
  Watcher = require('broccoli/lib/watcher'),
  Server = require('tiny-lr').Server,
  HashTree = require('./hash-tree'),
  broccoli = require('broccoli'),
  path = require('path'),
  util = require('util');

function LiveReload( options ) {
  if (!(this instanceof LiveReload)) {
    return new LiveReload(options);
  }

  var tree = broccoli.loadBrocfile(),
    builder = new broccoli.Builder(tree),
    watcher = new Watcher(builder),
    server = new Server();

  this.server = server;

  this.options = util._extend({
    port: 35729,
    path: 'assets',
  }, options);

  server.listen(this.options.port, this.onError);

  watcher.on('change', this.onChange.bind(this));

  watcher.on('error', this.onError);

  return middleware(watcher);
};

LiveReload.prototype.onError = function( err ) {
  if (err) {
    console.log(err.stack || err);
  }
};

LiveReload.prototype.onChange = function( info ) {
  var tree = new HashTree(info.directory, this.options),
    self = this;

  tree.computeHashes(function( err, nodes ) {
    if (err) {
      return console.log(err);
    }

    if (self.tree) {
      var diffs = self.tree.computeDiff(nodes).map(function( file ) {
        return path.join(self.options.path, file);
      });

      if (diffs.length) {
        self.server.changed({
          body: {
            files: diffs
          }
        });
      }
    }

    self.tree = tree;
  });
};

module.exports = LiveReload;