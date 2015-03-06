'use strict'

var path = require('path')
var exec = require('mz/child_process').exec
var request = require('request')
var router = require('koa-router')
var parse = require('co-body')
var gulp = require('gulp')
var gulpEditorconfigValidate = require('editorconfig-validate/gulpplugin')
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
			yield exec('./bin/.pull-request ' + params, {cwd: root})
			var cmd = 'git diff ' + baseRepo.origin + '/' + baseRepo.branch + ' ' + headRepo.origin + '/' + headRepo.branch + ' --name-only'
			var res = yield exec(cmd, {
				cwd: path.resolve(root, 'repo', baseRepo.origin, baseRepo.name)
			})
			var diffFiles = res[0].split('\n')
			diffFiles.pop()
			console.log(diffFiles)

			var num = 1
			var reports = []
			var repo = baseRepo.origin + '/' + baseRepo.branch
			var sha = head.sha
			var stream = gulp.src(diffFiles, {
				cwd: path.resolve(root, 'repo', baseRepo.origin, baseRepo.name),
				buffer: false
			}).
			pipe(gulpEditorconfigValidate()).
			on('report', function (report, path) {
				console.log(report, path)
				if (report) {
					reports.push({
						path: path,
						report: report
					})
				}
				if (num++ === diffFiles.length) {
					if (reports.length) {
						var description = JSON.stringify(reports, null, '\t')
						console.log(repo, sha)
						pushState(repo, sha, 'failure', description).then(function(response) {
							console.log('test', response)
						})
					} else {
						pushState(repo, sha, 'success', 'All is well')
					}
				}
			}).
			on('error', function (err, path) {
				console.error(err, path)
			})

		} catch (err) {
			console.log(err)
		}
		this.status = 204
	}
}
