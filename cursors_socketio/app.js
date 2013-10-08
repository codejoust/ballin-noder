var express = require('express')
  , http = require('http');
 
var app = express()
  , PORT = process.env.PORT || 3000
  , server = app.listen(PORT)
  , io = require('socket.io').listen(server)
  , socket = io
  , sys = require('sys');

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

socket.on('connection', function(client){
  client.on('move_cursor', function(data){
    data.id = client.id;
    client.broadcast.emit('move', data);
  });
  client.on('close', function(){
    socket.broadcast.emit('close', socket.clientId);
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
 
app.get('/', function(req, res){
  res.render('index');
});
 
console.log("Express server listening on port " + PORT);

