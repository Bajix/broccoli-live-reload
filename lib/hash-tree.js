var minimatch = require('minimatch'),
  crypto = require('crypto'),
  async = require('async'),
  path = require('path'),
  fs = require('fs');

function walkRecursively( dirName, nodes, filter, iterator, cb ) {
  async.waterfall([
    function( cb ) {
      fs.readdir(dirName, cb);
    },
    function( files, cb ) {
      files = files.filter(function( file ) {
        if (path.extname(file)) {
          return filter(path.join(dirName, file));
        }

        return true;
      });

      async.each(files, function( file, cb ) {
        var pathname = path.join(dirName, file);

        fs.stat(pathname, function( err, stat ) {
          if (err) {
            return cb(err);
          }

          if (stat.isDirectory()) {
            var childNodes = nodes[file] = {};

            walkRecursively(pathname, childNodes, filter, iterator, cb);
          } else {
            iterator(pathname, function( err, val ) {
              if (err) {
                return cb(err);
              }
              nodes[file] = val;
              cb();
            });
          }
        });
      }, cb);
    }
  ], cb);
}

function computeHashes( dirName, nodes, filter, cb ) {
  walkRecursively(dirName, nodes, filter, function( pathname, cb ) {
    var stream = fs.createReadStream(pathname),
      md5 = crypto.createHash('md5');

    stream.on('data', function( data ) {
      md5.update(data);
    });

    stream.on('error', cb);
    stream.on('end', function() {
      cb(null, md5.digest('hex'));
    });
  }, function( err ) {
    cb(err, nodes);
  });
};

function HashTree( dirName, options ) {
  if (!(this instanceof HashTree)) {
    return new HashTree(dirName, options);
  }

  this.options = options || {};
  this.dirName = dirName;
  this.nodes = {};
};

HashTree.prototype.computeHashes = function ( cb ) {
  return computeHashes(this.dirName, this.nodes, this.filter.bind(this), cb);
};

HashTree.prototype.filter = function( pathname ) {
  var exclude = this.options.exclude,
    include = this.options.include,
    pattern = this.pattern,
    i;

  if (exclude) {
    for (i = 0; i < exclude.length; i++) {
      pattern = exclude[i];
      if (this.matchesPattern(pattern, pathname)) {
        return false;
      }
    }
  }

  if (include) {
    for (i = 0; i < include.length; i++) {
      pattern = include[i];
      if (this.matchesPattern(pattern, pathname)) {
        return true;
      }
    }
  }

  if (include || exclude) {
    return false
  }
  return true;
};

HashTree.prototype.matchesPattern = function( pattern, pathname ) {
  if (pattern instanceof RegExp) {
    return pattern.test(relativePath);
  }

  if (typeof pattern === 'string') {
    return minimatch(pathname, pattern);
  }

  if (typeof pattern === 'function') {
    return pattern(relativePath);
  }
};

HashTree.prototype.computeDiff = function( nodes ) {
  var diffList = [];

  function trimDuplicates( list ) {
    for (var i = list.length - 1; i >= 0; i--) {
      var val = list[i],
        index = list.indexOf(val);

      if (index !== i) {
        list.splice(index, 1);
      }
    }

    return list;
  }

  function walkNodes( dirName, aTree, bTree ) {
    var keys = [];

    if (typeof aTree === 'object') {
      Array.prototype.push.apply(keys, Object.keys(aTree));
    }

    if (typeof bTree === 'object') {
      Array.prototype.push.apply(keys, Object.keys(bTree));
    }

    trimDuplicates(keys);

    keys.forEach(function( key ) {
      var pathname = path.join(dirName, key),
        aVal = aTree && aTree[key],
        bVal = bTree && bTree[key];

      if (typeof aVal === 'object' || typeof bVal === 'object') {
        return walkNodes(pathname, aVal, bVal);
      }

      if (aVal !== bVal) {
        diffList.push(pathname);
      }
    });
  };

  walkNodes('./', this.nodes, nodes);

  return diffList;
};

module.exports = HashTree;