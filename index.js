const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  path: '/socket'
});

let users = [];

io.use((socket, next)=>{
  //console.log(socket.id, socket.handshake);
  // if not auth found or auth was invalid then return false;
  // if (socket.handshake.auth == invalid) .....
  // socket.destroy();
  // return false;
  // else call next();

  const {id, name} = socket.handshake.auth;

  // add userid after auth or add name;
  socket.userid = id;
  socket.name = name


  // push socket connection to users array
  users.push(socket);
  next();
})

io.on('connection', (socket) => {
  console.log('[!] user connected.');

  // when emit message send to specific user;
  socket.on('message', (e)=>{
    const {to, msg} = e;
    // filter user and prevent message to get back to sender
    users.forEach((x)=>{
      if(x.id != socket.id && to == x.userid ){
        x.send({from: x.name, msg: msg});
      }
    });
  })

  //
  socket.on('disconnect', () => {
    console.log('[!] user disconnected.', socket.userid);
    users = users.filter((e)=>{
      return e.id != socket.id;
    });
  });
});

http.listen(3000, () => {
  console.log('[!] Socket.IO server is listening on port 3000');
});
