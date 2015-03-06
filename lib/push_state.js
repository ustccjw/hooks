var path = require('path')
var request = require('request')

/**
 * push commit state to github
 * @param  {string} repo        'ustccjw/hooks'
 * @param  {string} sha         commit SHA1
 * @param  {string} state       'pending', 'success', 'error' or 'failure'
 * @param  {string} description
 * @param  {string} username
 * @param  {string} password
 * @return {[type]}
 */
function push_state(repo, sha, state, description, username, password) {
	return new Promise(function (resolve, reject) {
		var url = path.resolve('https://api.github.com/repos/', repo, sha)
		request.post({
			url: url,
			auth: {
				user: username,
				pass: password
			},
			headers: {
				'User-Agent': 'request'
			},
			json: true,
			body: {
				state: state,
				description: description
			}
		}, function (error, response, body) {
			if (error) {
				reject(error)
			} else {
				resolve(body)
			}
		})
	})
}

module.exports = push_state
