var path = require('path')
var Validator = require('lintspaces')

function check_editorconfig(files, editorconfig) {
	editorconfig = editorconfig || path.resolve(__dirname, '../.editorconfig')
	var validator = new Validator({
		editorconfig: editorconfig,
		ignores: [
			'js-comments'
		]
	})
	files.forEach(function (file) {
		validator.validate(file)
	})
}

validator.validate('/path/to/file.ext');
validator.validate('/path/to/other/file.ext');

var results = validator.getInvalidFiles();
