const express = require('express')

const PORT = process.env.PORT || 3001;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, {
    root: __dirname
  }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = require('socket.io')(server);
const handles = require('./handles');
const {
  peers
} = require('./db');
io.on('connection', (socket) => {
  try {
    handles.newPeer(socket.id);
    socket.on('peer', (data) => {
      const peer = handles.setSignal(socket.id, data);
      socket.emit('peer-id', peer.id);
    });
  } catch {
    console.log('error')
  }
  socket.on('get-signal', (data) => {
    try {
      const signal = handles.getSignal(data);
      socket.emit('incoming-signal', signal);
    } catch {
      console.log('error')
    }
  });
  socket.on('set-answer', (data) => {
    try {
      const rec = peers.getById(data.id).value();
      if (rec) {
        io.to(rec.socketId).emit('answer-signal', data.signal);
      }
    } catch {
      console.log('error')
    }
  });
  socket.on('disconnect', () => {
    try {
      handles.deletePeer(socket.id);
    } catch {
      console.log('error')
    }
  });
});
