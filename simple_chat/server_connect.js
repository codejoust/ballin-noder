var http = require('http')
  , fs   = require('fs')
  , events = require('events')
  , express = require('express')
  , ejs = require('ejs') // for express rendering
  , app = express();

var stream = new events.EventEmitter();

app.configure(function(){
	app.use(express.bodyParser());
});

app.get('/poll', function(req, res){
	stream.once('chat', function(message){
		res.send(message);
	})
});

app.get('/', function(req, res){
	res.set('Content-Type', 'text/html');
	res.render('index.ejs');
});

app.post('/message', function(req, res){
	if (req.body.message){
		stream.emit('chat', req.body.message);
	}
	res.end('ok');
});

app.listen(3000);
