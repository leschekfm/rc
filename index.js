#! /usr/bin/env node
var cc   = require('./lib/utils')
var join = require('path').join
var deepExtend = require('deep-extend')
var etc = '/etc'
var win = process.platform === "win32"
var home = win
           ? process.env.USERPROFILE
           : process.env.HOME

module.exports = function (name, defaults, argv, parse) {
  if('string' !== typeof name)
    throw new Error('rc(name): name *must* be string')
  if(!argv)
    argv = require('minimist')(process.argv.slice(2))
    
  // make sure defaults has the right type
  defaults = defaults || {};
  if (typeof defaults !== 'object' || Array.isArray(defaults)) {
      throw new Error('defaults has to be an object')
  }

  parse = parse || cc.parse

  var env = cc.env(name + '_')

  var configs = [defaults]
  var configFiles = []
  function addConfigFile (file, throwError) {
    if (configFiles.indexOf(file) >= 0) return
    var fileConfig = cc.file(file, throwError)
    if (fileConfig) {
      configs.push(parse(fileConfig))
      configFiles.push(file)
    }
  }

  // which files do we look at?
  if (!win)
   [join(etc, name, 'config'),
    join(etc, name + 'rc')].forEach(addConfigFile)
  if (home)
   [join(home, '.config', name, 'config'),
    join(home, '.config', name),
    join(home, '.' + name, 'config'),
    join(home, '.' + name + 'rc')].forEach(addConfigFile)
  addConfigFile(cc.find('.'+name+'rc'))
  if (env.config) addConfigFile(env.config, true)
  if (argv.config) addConfigFile(argv.config, true)

  return deepExtend.apply(null, configs.concat([
    env,
    argv,
    configFiles.length ? {configs: configFiles, config: configFiles[configFiles.length - 1]} : undefined,
  ]))
}

if(!module.parent) {
  console.log(
    JSON.stringify(module.exports(process.argv[2]), false, 2)
  )
}
