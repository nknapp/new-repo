#!/usr/bin/env node-harmony

// Uses github token from env-variable GH_TOKEN for authorization

var cp = require('child_process')
var fs = require('fs')
var request = require('request')
var github = request.defaults({
  headers: {
    'User-Agent': 'New-Repo-Tool',
    'Authorization': `token ${process.env['GH_TOKEN']}`
  },
  json: true
})

var packageJson = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf-8'}))
var [ ,org,name ] = packageJson.repository.url.match(/git@github\.com:(.*)\/(.*)\.git/)

function git(...params) {
  const execFileSync = cp.execFileSync('git',params, { encoding: 'utf-8' });
  console.log("git", params.join(' '),"\n", execFileSync)
  return execFileSync
}

git('init')
if (git('remote').indexOf('origin')>=0) {
  git('remote', 'set-url', 'origin', packageJson.repository.url);
} else {
  git('remote', 'add', 'origin', packageJson.repository.url);
}

git('add', '.')
try {
  git('commit', '-m', 'Initial check-in')
} catch (e) {
  console.log("Ignoring commit error")
}


createRepo(org,name, packageJson.description, function (err) {
  if (err) {
    return console.log(err);
  }
  git('push','-u','origin','master')
})


/**
 * Create the github repository
 * @param org
 * @param name
 * @param cb
 */
function createRepo(org, name, description, cb) {
  // Check if "org" is the current user
  github.get(`https://api.github.com/user`, function (err, response, body) {
    if (err) {
      return cb(err);
    }
  //  console.log(response);
    if (response.statusCode >= 400) {
      return cb(new Error(`Getting use resulted in ${response.statusCode} ${response.statusMessage}: ${response.body}`))
    }
    try {
      var isUser = body.login === org
      console.log("Current user: "+body.login);
      var url = isUser ? 'https://api.github.com/user/repos' : `https://api.github.com/orgs/${org}/repos`
      github.post(url, {
        json: {
          name: name,
          description: description
        }
      }, function(err, response, body) {
        if (err) {
          cb(err);
        }
        if (response.statusCode === 422) {
          console.log("Repository already exists")
          return cb();
        }
        if (response.statusCode >= 400) {
          return cb(new Error(`${url} resulted in ${response.statusCode} ${response.statusMessage}: ${response.body}`))
        }
      })
    } catch (e) {
      cb(e);
    }
  });

}

