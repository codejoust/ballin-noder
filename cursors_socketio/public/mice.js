// utility functions
function ratelimit(fn, ms) {
  var last = (new Date()).getTime();
  return (function() {
    var now = (new Date()).getTime();
    if (now - last > ms) {
      last = now;
      fn.apply(null, arguments);
    }
  });
}

function $id(nm){
  return document.getElementById(nm);
}

// called when move data is gotten from the socket, updates or adds cursors
function move(mouse_data){
    var mouse = $id('mouse_'+mouse_data.id);
    if(!mouse) {
      mouse = document.createElement('span');
      mouse.className = 'mouse';
      mouse.id = 'mouse_' + mouse_data.id;
      mouse.innerHTML = ' ';
      document.body.appendChild(mouse);
    }
    mouse.style.left = ((window.innerWidth - mouse_data.w) / 2 + mouse_data.x) + 'px';
    mouse.style.top = mouse_data.y + 'px';
};

// when you move the cursor
document.addEventListener('mousemove',
  // ratelimit to 40ms
  ratelimit(function(e){
    // send the message that you've moved the cursor
    socket.emit('move_cursor', {
      x: e.pageX,
      y: e.pageY,
      w: window.innerWidth,
      h: window.innerHeight
    });

  }, 40)
);

var socket = io.connect('http://localhost'),
    timeouts = {};

// when you get an update, draw it
socket.on('move', function(data){
  move(data);
});

// when someone leaves, remove their cursor :(
socket.on('close', function(client_id){
  var rm_el = $id('#mouse_'+client_id);
  rm_el.parentNode.removeChild(rm_el);
});
