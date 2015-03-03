'use strict'

var exec = require('mz/child_process').exec
var path = require('path')
var router = require('koa-router')
var parse = require('co-body')
var app = require('../app')

// router
app.use(router(app))
app.post('/pull-request', pullRequestServer)

app.get('/', test)

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
	if (action === 'opened') {

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
		} catch (err) {
			console.log(err)
		}
	}
}

function* test() {
	var baseRepo = {}
	var headRepo = {}
	var params = [
		baseRepo.url = 'https://github.com/armed/ordered-read-streams',
		baseRepo.origin = 'armed',
		baseRepo.branch = 'master',
		baseRepo.name = 'ordered-read-streams',
		headRepo.url = 'https://github.com/ustccjw/ordered-read-streams',
		headRepo.origin = 'ustccjw',
		headRepo.branch = 'test',
		headRepo.name = 'ordered-read-streams'
	].join(' ')
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
	} catch (err) {
		console.log(err)
	}
}
