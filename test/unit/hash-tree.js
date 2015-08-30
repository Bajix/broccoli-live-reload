var HashTree = require('hash-tree'),
  path = require('path');

describe('Hash Tree', function() {
  it('computes hashes', function( done ) {
    HashTree(path.resolve(__dirname, '../')).computeHashes(function( err, nodes ) {
      if (err) {
        return done(err);
      }

      assert.property(nodes, 'unit');
      assert.property(nodes.unit, 'hash-tree.js');
      assert.match(nodes.unit['hash-tree.js'], /[a-f0-9]{24}/i);
      done(err);
    });
  });

  describe('File Diffs', function() {
    beforeEach(function( done ) {
      var hashTree = this.unitTree = new HashTree(path.resolve(__dirname, '../'));
      hashTree.computeHashes(done);
    });

    beforeEach(function( done ) {
      var hashTree = this.libTree = new HashTree(path.resolve(__dirname, '../../lib'));
      hashTree.computeHashes(done);
    });

    it("lists paths that don't match", function() {
      var diffList = this.unitTree.computeDiff(this.libTree.nodes);

      assert.include(diffList, 'unit/hash-tree.js');
    });

    it("doesn't false positive", function() {
      var diffList = this.unitTree.computeDiff(this.unitTree.nodes);

      assert.lengthOf(diffList, 0);
    });
  });
});