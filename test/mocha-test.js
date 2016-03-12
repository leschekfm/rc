var rc = require('../');
var n = 'rc' + Math.random()
var assert = require('assert');

errorWorthyTypes = ['asdf', 1, [], function() { }]

describe('rc', function() {
  describe('second param (defaults)', function() {
    it('should thow error for non objects', function() {

      for (var i = 0; i < errorWorthyTypes.length; i++) {
        assert.throws(
          function() {
            rc(n, errorWorthyTypes[i]);
          }
        );
      }
    });
  });
  describe('--config param', function() {
    it('should throw an error if passed file is not present', function() {
      process.argv.push('--config', '.filedoesnotexistrc')

      assert.throws(
        function() {
          rc(n);
        }
      );
    });
  });
});
