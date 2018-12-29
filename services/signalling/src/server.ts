#!/bin/node
import http from 'http';
import socketIO, { Socket } from 'socket.io';

import { Error, sendError } from './errors';

const PORT: string = process.env.PORT || '8081';
const HOST_KEY: string = process.env.HOST_KEY || '';
const LOGGING = true;

const server = http.createServer();
const io = socketIO(server);

let host: Socket | null = null;
let mode: 'peer' | 'relay';

io.on('connection', (socket: Socket) => {
    LOGGING && console.log('New connection');

    if (host !== null) {
        socket.emit('mode', mode);
    }

    /** HOST MESSAGES */
    socket.on('register-host', (hostKey: string, m: 'peer' | 'relay') => {
        LOGGING && console.log(`Registering host: ${socket.id}`);
        if (hostKey !== HOST_KEY) return sendError(socket, Error.INVALID_HOST_KEY);
        if (host !== null) return sendError(socket, Error.EXISTING_HOST);

        host = socket;
        mode = m;

        LOGGING && console.log('Host registered');
        host.on('disconnect', () => {
            LOGGING && console.log('Host disconnected');
            host = null;
            Object.values(io.sockets.connected).forEach(s => s.disconnect());
        });

        host.on('host-description', (controllerId, description) => {
            if (mode !== 'peer') return sendError(socket, Error.INCORRECT_MODE);
            LOGGING && console.log(`Host description reveived: ${description}`);
            const controller = io.sockets.connected[controllerId];
            if (!controller) return sendError(socket, Error.NO_CONTROLLER);
            LOGGING && console.log(`Sending description to controller: ${controllerId}`);
            controller.emit('host-description', description);
        });

        host.on('host-ice-candidate', (controllerId, icecandidate) => {
            if (mode !== 'peer') return sendError(socket, Error.INCORRECT_MODE);
            LOGGING && console.log(`Host ice candidate received: ${icecandidate}`);
            const controller = io.sockets.connected[controllerId];
            if (!controller) return sendError(socket, Error.NO_CONTROLLER);
            LOGGING && console.log(`Sending ice candidate to controller: ${controllerId}`);
            controller.emit('host-ice-candidate', icecandidate);
        });
    });

    /** CONTROLLER MESSAGES */
    socket.on('controller-description', description => {
        LOGGING && console.log('Controller description received');
        LOGGING && console.log(`controllerId: ${socket.id}`);
        LOGGING && !!description && console.log(`description: ${description}`);
        if (host === null) return sendError(socket, Error.NO_HOST);
        if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);

        if (mode === 'relay' && !!description) return sendError(socket, Error.INCORRECT_MODE);

        LOGGING && console.log('Sending description to host');

        host.emit('controller-description', socket.id, description);
    });

    socket.on('controller-ice-candidate', icecandidate => {
        if (mode !== 'peer') return sendError(socket, Error.INCORRECT_MODE);
        LOGGING && console.log('Controller ice candidate received');
        LOGGING && console.log(`controllerId: ${socket.id}`);
        LOGGING && console.log(`icecandidate: ${icecandidate}`);
        if (host === null) return sendError(socket, Error.NO_HOST);
        if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);
        LOGGING && console.log('Sending ice candidate to host');
        host.emit('controller-ice-candidate', socket.id, icecandidate);
    });

    socket.on('controller-input', (name: string, value: string) => {
        if (mode !== 'relay') return sendError(socket, Error.INCORRECT_MODE);
        LOGGING && console.log('Controller input received');
        LOGGING && console.log(`input name: ${name}`);
        LOGGING && console.log(`input value: ${value}`);
        if (host === null) return sendError(socket, Error.NO_HOST);
        if (socket.id === host.id) return sendError(socket, Error.SELF_HOST);
        LOGGING && console.log('Sending controller input to host');
        host.emit('controller-input', socket.id, name, value);
    });
});

server.listen(PORT, () => {
    console.log(`Signalling server listening on: ${PORT}`);
});
