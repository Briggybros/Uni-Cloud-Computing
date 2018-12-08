#!/bin/node
import http from 'http';
import socketIO, { Socket } from 'socket.io';

import { Error, sendError } from './errors';

const PORT: string = process.env.PORT || '8081';
const HOST_KEY: string = process.env.HOST_KEY || '';
const LOGGING = false;

const server = http.createServer();
const io = socketIO(server);

let host: Socket | null = null;

io.on('connection', (socket: Socket) => {
  LOGGING && console.log('New connection');

  /** HOST MESSAGES */
  socket.on('register-host', hostKey => {
    LOGGING && console.log('Registering host');
    if (hostKey !== HOST_KEY) return sendError(socket, Error.INVALID_HOST_KEY);
    if (host !== null) return sendError(socket, Error.EXISTING_HOST);

    host = socket;
    LOGGING && console.log('Host registered');
    host.on('disconnect', () => {
      LOGGING && console.log('Host disconnected');
      host = null;
    });

    host.on('host-description', (controllerId, description) => {
      LOGGING && console.log('Host description reveived');
      const controller = io.sockets.connected[controllerId];
      if (!controller) return sendError(socket, Error.NO_CONTROLLER);
      LOGGING && console.log('Sending description to controller');
      controller.emit('host-description', description);
    });

    host.on('host-ice-candidate', (controllerId, icecandidate) => {
      LOGGING && console.log('Host ice candidate received');
      const controller = io.sockets.connected[controllerId];
      if (!controller) return sendError(socket, Error.NO_CONTROLLER);
      LOGGING && console.log('Sending ice candidate to controller');
      controller.emit('host-ice-candidate', icecandidate);
    });
  });

  /** CONTROLLER MESSAGES */
  socket.on('controller-connect', () => {
    LOGGING && console.log('Controller connect request recieved');
    if (host === null) return sendError(socket, Error.NO_HOST);
    if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);
    LOGGING && console.log('Sending request to host');
    host.emit('controller-connect', socket.id);
  });

  socket.on('controller-description', description => {
    LOGGING && console.log('Controller description received');
    if (host === null) return sendError(socket, Error.NO_HOST);
    if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);
    LOGGING && console.log('Sending description to host');
    host.emit('controller-description', socket.id, description);
  });

  socket.on('controller-ice-candidate', icecandidate => {
    LOGGING && console.log('Controller ice candidate received');
    if (host === null) return sendError(socket, Error.NO_HOST);
    if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);
    LOGGING && console.log('Sending ice candidate to host');
    host.emit('controller-ice-candidate', socket.id, icecandidate);
  });
});

server.listen(PORT, () => {
  console.log(`Signalling server listening on: ${PORT}`);
});
