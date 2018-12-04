#!/bin/node
import http from 'http';
import socketIO, { Socket } from 'socket.io';

import { Error, sendError } from './errors';

const PORT: string = process.env.PORT || '8081';
const HOST_KEY: string = process.env.HOST_KEY || '';

const server = http.createServer();
const io = socketIO(server);

let host: Socket | null;

io.on('connection', (socket: Socket) => {
  /** HOST MESSAGES */
  socket.on('register-host', hostKey => {
    if (hostKey !== HOST_KEY) return sendError(socket, Error.INVALID_HOST_KEY);
    if (host === null) return sendError(socket, Error.EXISTING_HOST);

    host = socket;
    host.on('disconnect', () => {
      host = null;
    });

    host.on('host-description', (controllerId, description) => {
      const controller = io.sockets.connected[controllerId];
      if (!controller) return sendError(socket, Error.NO_CONTROLLER);
      controller.emit('host-description', description);
    });

    host.on('host-ice-candidate', (controllerId, icecandidate) => {
      const controller = io.sockets.connected[controllerId];
      if (!controller) return sendError(socket, Error.NO_CONTROLLER);
      controller.emit('host-ice-candidate', icecandidate);
    });
  });

  /** CONTROLLER MESSAGES */
  socket.on('controller-connect', () => {
    if (host === null) return sendError(socket, Error.NO_HOST);
    if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);
    host.emit('controller-connect', socket.id);
  });

  socket.on('controller-description', description => {
    if (host === null) return sendError(socket, Error.NO_HOST);
    if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);
    host.emit('controller-description', socket.id, description);
  });

  socket.on('controller-ice-candidate', icecandidate => {
    if (host === null) return sendError(socket, Error.NO_HOST);
    if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);
    host.emit('controller-ice-candidate', socket.id, icecandidate);
  });
});

server.listen(PORT, () => {
  console.log(`Signalling server listening on: ${PORT}`);
});
