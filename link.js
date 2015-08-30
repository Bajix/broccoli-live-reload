var path = require('path'),
  fs = require('fs');

process.chdir(__dirname);

function isHidden( path ) {
  return (/(^|.\/)\.+[^\/\.]/g).test(path);
};

function symlink( srcPath, destPath ) {
  var lstat = fs.lstatSync(srcPath),
    isDir = lstat.isDirectory();

  if (lstat.isSymbolicLink()) {
    srcPath = fs.realpathSync(srcPath);
  } else {
    srcPath = path.resolve(__dirname, srcPath);
  }

  fs.symlinkSync(srcPath, destPath, isDir ? 'dir': 'file');
};

try {
  fs.mkdirSync(path.resolve('./node_modules'));
} catch (e) {}

fs.readdirSync('./lib').forEach(function( source ) {
  var srcPath = path.resolve('./lib', source),
    destPath = path.resolve('./node_modules', source);

  if (!isHidden(srcPath)) {
    try {
      symlink(srcPath, destPath);
    } catch (e) {}
  }
});