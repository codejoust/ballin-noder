var http = require('http')
  , fs   = require('fs')
  , routes = require('./routes');



http.createServer(function(req, res){
	
	var test_route = routes[req.method + ':' + req.url.match(/\/([A-Za-z0-9]*)/)[1]];
	
	// :-).
	
	if (!test_route) test_route = routes['GET:404'];
	// if not found, 404.
	
	test_route(req, res);
	// send to router.

}).listen(1337);
