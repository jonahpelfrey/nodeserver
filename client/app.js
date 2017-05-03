var app = angular.module('trivia', ['ngRoute', 'ngResource']);

app.config(function($routeProvider) {
	'use strict';

	$routeProvider
	.when('/', {
		templateUrl: 'views/connection.html',
		controller: 'ConnectController'
	})
	.otherwise({
		redirectTo: '/'
	});
	
});

app.factory('userService', function($resource) {
	return $resource('trivia/users', {});
});

app.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootscope.$apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

app.controller('ConnectController', function($scope, $http, userService, socket) {
	
	$scope.users = userService.query();
	$scope.user = {};
	$scope.name = '';
	$scope.token = '';

	socket.on('connect', function(data) {
        socket.emit('join', 'Hello World from client');
    });

    socket.on('newjoin', function(data) {
      console.log(data);
    });

    socket.on('startgame', function(data) {
    	console.log(data);
    });


    $scope.submit = function() {
    	var data = {
    		id: $scope.name,
    		token: $scope.token,
    	}

    	socket.emit('submission', data);
    }

	$scope.join = function() {

		$http({
	      method: 'POST',
	      url: 'http://localhost:8000/trivia/signup',
	      data: {name: $scope.name}
	    }).then(function successCallback(response) {
	      
	      console.log(response.data.user._id);
	      var data = {
	      	token: "123",
	      	id: response.data.user._id
	      }
	      socket.emit('register', data);

	    }, function errorCallback(response) {
	      // called asynchronously if an error occurs
	      // or server returns response with an error status.
	      console.log(response);
	    });

	};

	$scope.start = function() {
		var data = {
			token: $scope.token
		}
		socket.emit('begin', data);
	}

});




