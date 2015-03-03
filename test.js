var request = require('request')

var url = 'https://api.github.com/repos/ustccjw/ordered-read-streams/statuses/204c07a011322db23e1c298634b41cc83b84060a'
request.post({
	url: url,
	auth: {
		user: 'ustccjw',
		pass: 'cjw5253352533'
	},
	headers: {
		'User-Agent': 'request'
	},
	json: true,
	body: {
		state: 'failure'
	}
}, function (error, response, body) {
	console.log(body)
})
