var http = require('http')
  , fs   = require('fs')
  , Readable = require('stream').Readable;

var index_html = fs.readFileSync('chatroom.html');


function StreamAgent(){

	var listeners = {};

	this.broadcast = function(type, message){
		if (!listeners[type]){
			listeners[type] = [];
			return;
		}
		for (var i = 0; i < listeners[type].length; i++){
			if (listeners[type][i] != null){
				(listeners[type][i])(message);
				listeners[type][i] = null;
			}
		}
	}

	this.on = function(type, listen_fn){
		if (!listeners[type]){
			listeners[type] = [];
		}
		listeners[type].push(listen_fn);
	}

}

var stream = new StreamAgent();

var routes = {
	"GET:poll": function(req, res){
		stream.on('chat', function(message){
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(message);
		});
	},
	"GET:": function(req, res){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(index_html);
	},
	"GET:404": function(req, res){
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end('Page Not Found!');
	},
	"POST:message": function(req, res){
		var post_body = '';
		req.on('data', function(data){
			post_body += data;
		});
		req.on('end',  function(){
			stream.broadcast('chat', post_body);
		})
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('ok');
	}
}

http.createServer(function(req, res){
	
	var test_route = routes[req.method + ':' + req.url.substr(1)];
	// :-).
	
	if (!test_route) test_route = routes['GET:404'];
	// if not found, 404.
	
	test_route(req, res);
	// send to router.

}).listen(1337);



