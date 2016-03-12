var rc = require('../');
var n = 'rc' + Math.random()
var assert = require('assert');

errorWorthyTypes = ['asdf', 1, [], function() { }]

describe('rc', function() {
  describe('environment variables', function() {
    before(function() {
      process.env['anything'] = 'not-avaliable'
      process.env[n + '_simpleOption'] = 42
      process.env[n + '_notSoSimpleOption__nested'] = 'crazy'
      config = rc(n);
    });
    after(function() {
      delete process.env['anything']
      delete process.env[n + '_simpleOption']
      delete process.env[n + '_notSoSimpleOption__nested']
    });
    it('should add vars prepended with module name', function() {
      assert.equal(config.simpleOption, 42)
    });
    it('should not add vars with other names', function() {
      assert.notEqual(config.anything, 'not-avaliable')
    });
    it('should allow nested variables', function() {
      assert.equal(config.notSoSimpleOption.nested, 'crazy')
    })
  });
  describe('second param (defaults)', function() {
    it('should throw error for non objects', function() {
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
