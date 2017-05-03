var mongoose = require('mongoose');
var User = require('./user.js');
var Schema = mongoose.Schema;

var Game = new Schema({

	users: [String],
	token: {
		type: String,
		default: ''
	},
	completion: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('Game', Game);
