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
function push_state(repo, sha, state, description, token) {
	return new Promise(function (resolve, reject) {
		var url = 'https://api.github.com/repos/' + repo + '/statuses/' + sha
		console.log(url)
		request.post({
			url: url,
			auth: {
				user: 'ustccjw',
				pass: 'cjw5253352533'
				// token: '1fe4e06ae04d49bda2529f722fb232b7c24675e9'
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
