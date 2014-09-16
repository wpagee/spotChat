var http = require("http");
var url = require("url");
var utils = require("./utils");

function onRequest(request, response) {
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received.");

	utils.route(pathname);

	var a = { one: 1 };
	var b = { two: 2 };
	utils.merge(a, b);
	console.dir(a);

	response.writeHead(200, { 'Content-Type': 'text/plain' });
	response.write("Hello World Mod");
	response.end();
};

exports.start = function() {
	http.createServer(onRequest).listen(8888);
	console.log("Server has started.");
};


