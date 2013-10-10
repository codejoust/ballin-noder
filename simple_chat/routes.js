
var index_html = require('fs').readFileSync('chatroom.html');
var events = require('events')
var stream = new events.EventEmitter();

module.exports = {
	// AJAX Long Polling Route
	"GET:poll": function(req, res){
		stream.once('chat', function(message){
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(message);
		});
	},
	// Index.html Page
	"GET:": function(req, res){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(index_html);
	},
	// 404 page :( (called by simple router)
	"GET:404": function(req, res){
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end('Page Not Found!');
	},
	// Message Post Page
	"POST:message": function(req, res){
		var post_body = '';
		req.on('data', function(data){
			post_body += data;
		});
		req.on('end', function(){
			stream.emit('chat', post_body);
		})
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('ok');
	}
}