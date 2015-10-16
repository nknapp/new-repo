#!/usr/bin/env node

var cp = require('child_process')
// var fs = require('fs')
// var path = require('path')

var result = process.argv.slice(2).map(function (arg) {
  console.log(arg)
  try {
    var describe = cp.execSync('git describe', {
      cwd: arg,
      encoding: 'utf-8'
    })
      // If the release-tag is not the latest commit, the pattern does not match
    if (describe.match(/-\d+-\w*/)) {
        return { "dir": arg, "describe": describe }
    }
  } catch (e) {
  }
}).filter(function(a) {
    return a
})

console.log(result)
