var sys = require('sys'),
    http = require('http'),
    crypto = require('crypto');
    io = require('../'),
    server = http.createServer(),
    socket = io.listen(server),
    json = JSON.stringify,
    log = sys.puts;

server.listen(8000);

socket.on('connection', function(client){
  client.on('message', function(message){
    try {
      request = JSON.parse(message.replace('<', '&lt;').replace('>', '&gt;'));
    } catch (SyntaxError) {
      log('Invalid JSON:');
      log(message);
      return false;
    }

    if(request.action != 'close' && request.action != 'move' && request.action != 'speak') {
      log('Ivalid request:' + "\n" + message);
      return false;
    }

    if(request.action == 'speak') {
      request.email = crypto.createHash('md5').update(request.email).digest("hex");
      client.send(json(request));
    }
    
    request.id = client.sessionId
    client.broadcast(json(request));
  });

  client.on('disconnect', function(){
    client.broadcast(json({'id': client.sessionId, 'action': 'close'}));
  });
});
