'use strict';
var fs   = require('fs')
var ini  = require('ini')
var path = require('path')
var stripJsonComments = require('strip-json-comments')

var parse = exports.parse = function (content) {

  //if it ends in .json or starts with { then it must be json.
  //must be done this way, because ini accepts everything.
  //can't just try and parse it and let it throw if it's not ini.
  //everything is ini. even json with a syntax error.

  if(/^\s*{/.test(content))
    return JSON.parse(stripJsonComments(content))
  return ini.parse(content)

}

// reads a file and returns it's content
var file = exports.file = function (file, throwError) {
  try {
    return fs.readFileSync(file, 'utf-8')
  } catch (err) {
    // Array.forEach() passes in the index, therefore check if second value is boolean
    if (throwError === true) {
      throw new Error('Explicitly passed config file could not be found at: ' + path.resolve(file));
    }
    return
  }
}

var env = exports.env = function (prefix, env) {
  env = env || process.env
  var obj = {}
  var l = prefix.length
  for(var k in env) {
    if((k.indexOf(prefix)) === 0) {

      var keypath = k.substring(l).split('__')

      // Trim empty strings from keypath array
      var _emptyStringIndex
      while ((_emptyStringIndex=keypath.indexOf('')) > -1) {
        keypath.splice(_emptyStringIndex, 1)
      }

      var cursor = obj
      keypath.forEach(function _buildSubObj(_subkey,i){

        // (check for _subkey first so we ignore empty strings)
        // (check for cursor to avoid assignment to primitive objects)
        if (!_subkey || typeof cursor !== 'object')
          return

        // If this is the last key, just stuff the value in there
        // Assigns actual value from env variable to final key
        // (unless it's just an empty string- in that case use the last valid key)
        if (i === keypath.length-1)
          cursor[_subkey] = env[k]


        // Build sub-object if nothing already exists at the keypath
        if (cursor[_subkey] === undefined)
          cursor[_subkey] = {}

        // Increment cursor used to track the object at the current depth
        cursor = cursor[_subkey]

      })

    }

  }

  return obj
}

// returns first occurrence of the filename or undefined if none exists
var find = exports.find = function (fileName) {

  function find(start, fileName) {
    var file = path.join(start, fileName)
    try {
      fs.statSync(file)
      return file
    } catch (err) {
      if(path.dirname(start) !== start) // root
        return find(path.dirname(start), fileName)
    }
  }
  return find(process.cwd(), fileName)
}

