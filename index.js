var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var storage = require('dom-storage');
var sessionStorage = new storage(null, { strict: false });

var _currentUser = {
	id: null,
	name: '',
	online: false,
};

var _peopleLoggedIn = 0;

app.get('/', function(req, res) {
	res.sendfile('index.html');
});

app.use('/css', express.static(__dirname + '/css'));

io.on('connection', function(socket){
	_peopleLoggedIn++;

	socket.on('disconnect', function() {
		console.log('user disconnected');
		_currentUser.online = false;
		_peopleLoggedIn--;
		io.emit('person connected', _peopleLoggedIn);
	});

	socket.on('chat message', function(msg) {
		var userName = sessionStorage.getItem('user');

		var chatMsg = {
			dateTime: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
			message: msg,
			name: userName != null ? userName.name : 'unknown'
		};

		io.emit('chat message', chatMsg);
	});

	socket.on('iframe update', function(url) {
		var _url = null;

		if(url.match('www.youtube.com')) {
			console.log('youtube video');
		} else if(url.match('spotify:track:')) {
			_url = ['https://embed.spotify.com/?uri=', url].join('');
		}
		if(_url == null) {
			_url = url;
		}
		io.emit('iframe update', _url);
	});

	socket.on('setUserName', function(name) {
		var _user = sessionStorage.getItem('user');
		if(_user != null) {
			_user.name = name;
		} else {
			_user = {
				id: null,
				name: name,
				online: false,
			};
		}

		sessionStorage.setItem('user', _user);
	});

	io.emit('person connected', _peopleLoggedIn);
})

http.listen(8080, function() {
	console.log('listening om *:8080');
});