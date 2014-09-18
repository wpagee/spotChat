var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var moment = require('moment');
var storage = require('dom-storage');
var localStorage = new storage('./users.json', { strict: false, ws: ' ' });

app.get('/', function(req, res) {
	res.sendfile('index.html');
});

app.use('/css', express.static(__dirname + '/css'));

io.on('connection', function(socket){

	socket.on('disconnect', function() {
		console.log('user disconnected');

		var userCount = localStorage.getItem('userCount');
		userCount = userCount != null ? userCount - 1 : 0;
		if(userCount < 0) {
			userCount = 0;
		}
		localStorage.setItem('userCount', userCount);
		localStorage.removeItem(socket.id);
		io.emit('person disconnected', userCount);
	});

	socket.on('chat message', function(msg) {
		var _user = localStorage.getItem(socket.id);

		var chatMsg = {
			dateTime: moment().format("MMM D, YYYY h:mm:ss a"),
			message: msg,
			name: _user != null ? _user.name : 'unknown',
			color: _user.color
		};

		io.emit('chat message', chatMsg);
	});

	socket.on('iframe update', function(url) {
		var _url = null;

		if(url.match('www.youtube.com')) {
			console.log('youtube video');
		} else if(url.match('spotify:track:')) {
			_url = ['https://embed.spotify.com/?uri=', url].join('');
		} else if(url.match('http://open.spotify.com/track/')) {
			_url = url.replace('http://open.spotify.com/track/', 'https://embed.spotify.com/?uri=spotify:track:');
		} else if(url.match('spotify:user:') && url.match(':playlist:')) {
			_url = ['https://embed.spotify.com/?uri=', url].join('');
		}
		if(_url == null) {
			_url = url;
		}
		console.log(_url);
		io.emit('iframe update', _url);
	});

	socket.on('setUser', function(name) {
		var _userCount = localStorage.getItem('userCount'),
			_user = {
				name: name || 'User ' + _userCount,
				color: '#' + Math.floor(Math.random()*16777215).toString(16)
			};

		if(_userCount == null) {
			_userCount = 1;
			localStorage.setItem('userCount', _userCount);
		} else {
			_userCount += 1;
			localStorage.setItem('userCount', _userCount);
		}

		localStorage.setItem(socket.id, _user);
		io.emit('person connected', _userCount);
	});

	socket.on('checkUser', function(id) {
		var _user = localStorage.getItem(id);
		if(_user != null) {
			return true
		}
		return false;
	});
});

server.listen(8080, function() {
	console.log('listening om *:8080');
});
