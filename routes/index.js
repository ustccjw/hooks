'use strict'

var path = require('path')
var exec = require('mz/child_process').exec
var request = require('request')
var router = require('koa-router')
var parse = require('co-body')
var editorconfigValidate = require('editorconfig-validate')
var app = require('../app')
var pushState = require('../lib/push_state')

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
			var root = path.resolve(__dirname, '../')
			var res = yield exec('./bin/.pull-request ' + params, {cwd: root})
			console.log(res)
			var cmd = 'git diff ' + baseRepo.origin + '/' + baseRepo.branch + ' ' + headRepo.origin + '/' + headRepo.branch + ' --name-only'
			var repo = path.resolve(root, 'repo', baseRepo.origin, baseRepo.name)
			res = yield exec('ls', {cwd: repo})
			console.log(res)
			res = yield exec(cmd, {cwd: repo})
			var diff = res[0].split('\n')
			diff.pop()
			console.log(diff)
			// editorconfigValidate(diff, )
			// var repo = baseRepo.origin + '/' + baseRepo.branch
			// pushState(repo, sha, state, description, username, password)

		} catch (err) {
			console.log(err)
		}
	}
}
