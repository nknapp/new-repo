#!/usr/bin/env node

var cp = require('child_process')
// var fs = require('fs')
// var path = require('path')

var result = process.argv.slice(2).map(function (arg) {
  try {
    var describe = cp.execSync('git describe', {
      cwd: arg,
      encoding: 'utf-8'
    })
      // If the release-tag is not the latest commit, the pattern does not match
      var match = describe.match(/(.*)-(\d+)-g(\w*)/);
      if (match) {
        return { "dir": arg, "describeMatch": match }
    }
  } catch (e) {
  }
}).filter(function(a) {
    return a
}).map(function(repo) {
    return {
        dir: repo.dir,
        tag: repo.describeMatch,
        log: cp.execSync('git log --boundary --oneline '+repo.describeMatch[1] + '..',{
            cwd: repo.dir,
            encoding: "utf-8"
        })
    }
}).forEach(function(repo) {
    console.log(repo.dir + ": "+repo.tag[1]+"\n\n"+repo.log+"\n\n-------------------------\n")
})

