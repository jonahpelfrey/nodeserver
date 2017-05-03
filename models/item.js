var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Item = new Schema({

	question: {
		type: String
	},
	answer: {
		type: String
	},
	choices: {
		type: [String]
	}
});

module.exports = mongoose.model('Item', Item);