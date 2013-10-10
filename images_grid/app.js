var express = require('express')
  , http = require('http')
  , fs = require('fs');
 
var app = express()
  , PORT = process.env.PORT || 3000
  , server = app.listen(PORT)
  , io = require('socket.io').listen(server)
  , sys = require('sys')
  , exec = require('child_process').exec;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

function ImageGrid(image_url, grid_x, grid_y){
  this.image_url = image_url;
  this.message = null;
  this.grid_x = grid_x;
  this.grid_y = grid_y;
  var self = this;
  this.has_image = function(){
    return self.image_url != null;
  }
  this.set_params = function(text, image_url){
    self.image_url = image_url;
    self.message = text;
  }
}

function StoreImage(GRID_SIZE, image_list){
  this.images = [];
  for (var i = 0; i < GRID_SIZE; i++){
    for (var j = 0; j < GRID_SIZE; j++){
      image = null;
      if (image_list && image_list.length){
        image = image_list.pop();
      }
      this.images.push(new ImageGrid(image, i, j));
    }
  }

  this.add_image = function(title, image){
    var image_el = null, count = 20;
    while(image_el == null && count--){
      image_el = this.images[Math.floor(Math.random()*this.images.length)];
    }
    image_el.set_params(title, image);
    return image_el;
  };
}

var GRID_SIZE = 4;

var image_list = fs.readdirSync(__dirname + '/public/uploaded_images/').map(function(el){
  return '/uploaded_images/' + el;
})
var store = new StoreImage(GRID_SIZE, image_list);


io.on('connection', function(client){
  client.on('vote', function(id){
    
  });
  client.emit('setup_grid', store.images);
});

 
app.get('/', function(req, res){
  res.render('index', {"grid_size": GRID_SIZE, "the": "world"});
});

app.get('/upload_image', function(req, res){
  res.send('<form action="/" method="post" enctype="multipart/form-data">'
    + '<p>Title: <input type="text" name="title" /></p>'
    + '<p>Image: <input type="file" name="image" /></p>'
    + '<p><input type="submit" value="Upload" /></p>'
    + '</form>');
});

function process_image(req, res){
  extName = req.files.image.path.match(/\.([a-zA-Z]+)*$/);
  if (extName[1]) extName = extName[1];
  var fullPath = __dirname + '/public/uploaded_images/' + Math.floor(Math.random()*100000) + '.' + extName;
  fs.rename(req.files.image.path, fullPath, function(){
    exec('mogrify '+ fullPath+'  -resize 300x300 ', function(err, stdout, stderr){
      if (!err && !stderr){
        var subPath = fullPath.substr(fullPath.indexOf('public/') + 7);
        var new_image = store.add_image(req.body.title, subPath);
        io.sockets.emit('add_grid', new_image);
        res.send({"err": false, "res": new_image});
      } else {
        res.send({"err": true, "err_msg": err, "stderr": stderr});
      }
    });
  });
}

app.post('/', function(req, res, next){
  // the uploaded file can be found as `req.files.image` and the
  // title field as `req.body.title`
  if (req.files && req.files.image && req.body.title){
    process_image(req, res);
  } else {
    next(); // err
  }
});

 
console.log("Express server listening on port " + PORT);
