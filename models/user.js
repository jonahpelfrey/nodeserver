var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({

	name: {
		type: String,
		required: true
	},
	points: {
		type: Number,
		default: 0
	},
	completed: {
		type: Boolean,
		default: false
	},
	socket: {
		type: String,
		default: ''
	},
	token: {
		type: String,
		default: ''
	}
});

module.exports = mongoose.model('User', User);
