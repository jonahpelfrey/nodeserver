module.exports = (function() {
	'use strict';
	var router = require('express').Router();
	var Item = require('./models/item.js');
	var User = require('./models/user.js');
	var Game = require('./models/game.js');

	//Endpoint to return all users
	router.route('/users')
	.get(function(req, res) {
		User.find(function(err, users) {
			if(err) res.send(err);
			else { res.json(users); }
		});
	});

	/**
	 * Retrieve user by ID
	 *	============================================
	 * 	(NOTE)
	 *	Mongo Object ID for a specific user is returned to the client view when a user is created.
	 *	This ID needs to be saved on the client side so that you can retrieve a specific user
	 *	============================================
	 * @param { id: (String) The user's mongo object ID token			}
	 * @return { user: (JSON) user object}
	 */
	 router.route('/user')
	 .post(function(req, res) {
	 	var id = req.body.id;
	 	User.findById(id, function(err, user) {
	 		if(err) res.send(err);
	 		else {
	 			res.json(user);
	 		}
	 	});
	 });

	/**
	 * Increment the points of the specified user by 1
	 * @param { id: (String) The user's Mongo Object ID			}
	 * @return { user: (JSON) user object}
	 */
	router.route('/increment')
	.post(function(req, res) {
		var id = req.body.id;
		User.findById(id, function(err, user) {
			if(err) res.send(err);
			else {
				user.points += 1;
				user.save(function(err, user) {
					if(err) res.send(err);
					else {
						res.json(user);
					}
				});
			}
		});
	});

	/**
	 * Clear the user's points
	 * @param { name: (String) The user's name			}
	 * @return { id: (String) user's ID in the DB, name: (String) user's chosen username}
	 */
	router.route('/clear')
	.post(function(req, res) {
		var id = req.body.id;
		User.findById(id, function(err, user) {
			if(err) res.send(err);
			else {
				user.points = 0;
				user.save(function(err, user) {
					if(err) res.send(err);
					else {
						res.json(user);
					}
				});
			}
		});
	});

	/**
	 * Adds new user to the database
	 * @param { name: (String) The user's name			}
	 * @return { id: (String) user's ID in the DB, name: (String) user's chosen username}
	 */
	router.route('/signup')
	.post(function(req, res) {
		var user = new User();
		user.name = req.body.name;
		user.save(function(err, user) {
			if(err) res.send(err);
			else {
				res.json({user});
			}
		});
	});

	/**
	 * Handles submission of answer from user
	 * @param { id: (String) The user's id			}
	 * @param { }
	 * @return { id: (String) user's ID in the DB, name: (String) user's chosen username}
	 */
	 router.route('submission')
	 .post(function(req, res) {
	 	User.findById(id, function(err, user) {

	 	})
	 })

	/**
	 * Adds user to specified game object
	 * @param {token: 	(String) Token that identifies the game 			}
	 * @param {user: 	(String) ID number associated with the user object 	}
	 * @return { JSON message }
	 */
	router.route('/adduser')
	.post(function(req, res) {
		Game.findOne({token: req.body.token}, function(err, game) {
			if(err) res.send(err);
			else {
				game.users.push(req.body.user);
				game.save(function(err) {
					if(err) res.send(err);
				});
				res.send({message: "game found"});
			}
		});
	});

	return router;
})();