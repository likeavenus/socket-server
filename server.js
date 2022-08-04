const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const cors = require('cors');

app.use(cors());
const players = {};
io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);
  players[socket.id] = {
    rotation: 0,
    velocity: {
      x: 0,
      y: 0,
    },
    scaleX: 0,
    offsetX: 0,
    x: Math.floor(Math.random() * 100) + 50,
    y: Math.floor(Math.random() * 100) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };
  socket.emit('current_players', players);
  socket.broadcast.emit('new_player', players[socket.id]);

  socket.on('player_moved', (movementData) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].velocity.x = movementData.velocity.x;
    players[socket.id].velocity.y = movementData.velocity.y;
    // players[socket.id].scaleX = movementData.scaleX;
    // players[socket.id].offsetX = movementData.scaleX;
    players[socket.id].animationKey = movementData.animationKey;
    socket.broadcast.emit('update_positions', players[socket.id]);
  })

  socket.on('disconnect',  () => {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('remove_player', socket.id);
  });
});

server.listen(8080, () => {
  console.log('listening on *:3000');
});