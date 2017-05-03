'use strict';

var Item = require('./models/item.js');
var User = require('./models/user.js');
var Game = require('./models/game.js');
var routes = require('./routes.js');

var request = require('request');
var path = require('path');
var morgan = require('morgan');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var server = require('http').Server(app);

var io = require('socket.io')(server);

var tokens = [];

/* URLS */
const sports = 'https://opentdb.com/api.php?amount=25&category=21&difficulty=medium&type=multiple';
const music = 'https://opentdb.com/api.php?amount=25&category=12&difficulty=medium&type=multiple';
const politics = 'https://opentdb.com/api.php?amount=25&category=24&difficulty=medium&type=multiple';
const science = 'https://opentdb.com/api.php?amount=25&category=17&difficulty=medium&type=multiple';

/* INITIALIZE EXPRESS PARAMS */
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}

app.set('port', process.env.PORT || 8000);
app.use(express.static(path.join(__dirname, './client')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(allowCrossDomain);

/*CONNECT TO DATABASE */
mongoose.connect('mongodb://heroku_j2qtxppp:1o16fpl8ev3r3jo83h7u4ei267@ds131041.mlab.com:31041/heroku_j2qtxppp', function(error) {
	if(error) console.log(error);
	else console.log("| Connected to Trivia Database |");
});

/* SOCKET CONNECTIONS */
io.sockets.on('connection', function(socket) {

	console.log("User has connected");

	socket.on('disconnect', function() {
		console.log("User has disconnected");
		// User.findOneAndRemove({socket: socket.id}, function(err, user) {
		// 	if(err) throw err;
		// });
	});

	/* JOIN GAME WITH SPECIFIED TOKEN */
	socket.on('register', function(data) {
		User.findById({_id: data.id}, function(err, user) {
			if(err) throw err;
			else {
				user.socket = socket.id;
				user.token = data.token;
				user.save(function(err) {
					if(err) console.log(err);
				});
			}
		});
		socket.join(data.token);
		io.sockets.in(data.token).emit('newjoin', data.name + ' has joined the game');
	});

	socket.on('begin', function(data) {
		io.sockets.in(data.token).emit('startgame', "we are starting the game");
	});

	socket.on('submission', function(data) {
		User.findById({_id: data.id}, function(err, user) {
			if(err) throw err;
			else {
				user.points += data.points;
				user.save(function(err) {
					if(err) throw err;
					else {
						cycleCheck(user.token);
					}
				});

			}
		});
	});
	
});

var cycleCheck = function(token) {
	Game.findOne({token: token}, function(err, game) {
		if(err) throw err;
		else {
			if(game.completion = game.users)
			{
				io.sockets.in(token).emit('nextround', "We are moving to the next round");
			}
		}
	});
}

/* ROUTER */
var router = express.Router();

router.route('/test')
.post(function(req, res) {
	var room = req.body.token;
	io.of('/').in(room).clients(function(err, clients) {
		if(err) res.send(err);
		else {
			res.json(clients);
		}
	});
});


/**
 * Retrieve a single question from the database, and remove it upon retrieval
 * @param NONE
 * @return 	{
				answer: 	(String) correct answer
				question: 	(String) the trivia question
				choices: 	[String] choices for answer, includes the correct answer and incorrect answers
 			}
 */
router.route('/next')
.get(function(req, res) {
	Item.find(function(err, items) {
		if(err) res.send(err);
		else {
			var active = items[0];
			Item.findByIdAndRemove(active._id, function(err, item) {
				if(err) res.send(err);
			});
			res.json(active); 
		}
	});
});

/**
 * Initializes the retrieval of questions, seeding of DB, and game creation / token creation
 * @param 	{ category: 	(String) Category of questions that you want to retrieve from the OpenTDB		}
 * @return 	{ token: (String) Token that identifies the game and can be used for a socket connection 	}
 */
router.route('/start')
.post(function(req, res) {

	var obj = [];
	var endp = '';

	switch(req.body.category) {
		case 'sports':
			endp = sports;
			break;
		case 'music':
			endp = music;
			break;
		case 'science':
			endp = science;
			break;
		case 'politics':
			endp = politics;
			break;
	}

	var options = {
		url: endp,
		method: 'GET',
	};

	request(options, function(err, res, body) {

		let questions = JSON.parse(body);
		
		for(var i =0; i < questions.results.length; i++) {

			var current = questions.results[i];
			obj.push(current.question);
			obj.push(current.correct_answer);
			obj.push.apply(obj, current.incorrect_answers);

			for(var j = 0; j < obj.length; j++) {

				if(obj[j].includes("&quot;")) {
					obj[j] = obj[j].replace(/&quot;/g, "'");			
				}

				if(obj[j].includes("&#039")) {
					obj[j] = obj[j].replace(/&#039;/g, "'");
				}
			}

			var item = new Item();
			item.question = obj.shift();
			item.choices.push.apply(item.choices, obj);
			item.choices.sort();
			item.answer = obj.shift();
			item.save(function(err) {
				if (err) res.send(err);
			});

			obj = [];
		}
		
	});

	// CREATE UNIQUE TOKEN, SAVE, RETURN RESPONSE
	var token = crypto.randomBytes(4).toString('hex');
	while(tokens.indexOf(token) >= 0)
	{
		token = crypto.randomBytes(4).toString('hex');
	}
	tokens.push(token);

	var game = new Game();
	game.token = token;
	game.save(function(err) {
		if(err) res.send(err);
	});

	res.json({ token: token });
});

app.use('/trivia', router);
app.use('/trivia', routes);

server.listen(app.get('port'), function() {
	console.log('Server running on port: 8000');
});






