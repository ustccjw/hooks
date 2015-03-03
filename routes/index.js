'use strict'

var path = require('path')
var exec = require('mz/child_process').exec
var request = require('request')
var router = require('koa-router')
var parse = require('co-body')
var app = require('../app')

// router
app.use(router(app))
app.post('/pull-request', pullRequestServer)

function* pullRequestServer() {
	var body = yield parse.json(this)
	var action = body.action
	var head = body.pull_request.head
	var base = body.pull_request.base
	var headRepo = {
		url: 'https://github.com/' + head.repo.full_name,
		origin: head.label.split(':').shift(),
		branch: head.ref,
		name: head.repo.name
	}
	var baseRepo = {
		url: 'https://github.com/' + base.repo.full_name,
		origin: base.label.split(':').shift(),
		branch: base.ref,
		name: head.repo.name
	}
	var params = [
		baseRepo.url,
		baseRepo.origin,
		baseRepo.branch,
		baseRepo.name,
		headRepo.url,
		headRepo.origin,
		headRepo.branch,
		headRepo.name
	].join(' ')
	if (action === 'opened' || action === 'synchronize') {

		// .editorconfig check
		try{
			var root = process.cwd()
			yield exec('bin/.pull-request ' + params, {cwd: root})
			var cmd = 'git diff ' + baseRepo.origin + '/' + baseRepo.branch + ' ' + headRepo.origin + '/' + headRepo.branch + ' --name-only'
			var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
			root = path.resolve(home, baseRepo.origin, baseRepo.name)
			var res = yield exec(cmd, {cwd: root})
			var diff = res[0].split('\n')
			diff.pop()
			console.log(diff)

			var url = 'https://api.github.com/repos/ustccjw/ordered-read-streams/statuses/8f55a03f39da94ead7c9c37757fb796f1e348e1b'
			request.post(url, {state: 'failure'}, function (error, response, body) {

			})


		} catch (err) {
			console.log(err)
		}
	}
}
