import io from 'socket.io-client';

enum RTCError {
  UNSUPPORTED_SDP = 'UNSUPPORTED_SDP',
  NEGOTIATION_ERROR = 'NEGOTIATION_ERROR',
  DATA_ERROR = 'DATA_ERROR',
}
const ERROR_MESSAGES = {
  [RTCError.UNSUPPORTED_SDP]: 'unsupported SDP type',
  [RTCError.NEGOTIATION_ERROR]: 'an error occurred in negotiation',
};

type EventType =
  | 'error'
  | 'data'
  | 'connectionestablished'
  | 'connectionterminated';

interface Controller {
  send: (type: string, ...params: any[]) => void;
}

interface Connection {
  addEventListener: (event: EventType, callback: Function) => void;
  getController: (controllerId: string) => Controller;
}

let connections: {
  [controllerId: string]: {
    connection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
  };
} = {};

export function connect(signalling: string): Connection {
  const HOST_KEY = '';
  const socket = io(signalling);
  let listeners: { [event: string]: Function[] } = {};
  function emitEvent(event: string, ...params: any[]) {
    if (listeners[event]) {
      listeners.event.forEach(listener => listener(...params));
    }
  }

  socket.on('error', (error: string, message: string) =>
    emitEvent('error', error, message)
  );

  socket.emit('register-host', HOST_KEY);

  socket.on('controller-connect', async (controllerId: string) => {
    const connection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const dataChannel = connection.createDataChannel('data', {
      ordered: false,
      maxPacketLifeTime: 1000,
    });

    connections = {
      ...connections,
      [controllerId]: {
        connection,
        dataChannel,
      },
    };

    connection.addEventListener('icecandidate', ({ candidate }) =>
      socket.emit('host-ice-candidate', controllerId, candidate)
    );

    try {
      await connection.setLocalDescription(await connection.createOffer());
      socket.emit(
        'host-description',
        controllerId,
        connection.localDescription
      );
    } catch (error) {
      emitEvent(
        'error',
        RTCError.NEGOTIATION_ERROR,
        error.message || ERROR_MESSAGES[RTCError.NEGOTIATION_ERROR]
      );
    }

    dataChannel.addEventListener('error', (errorEvent: RTCErrorEvent) =>
      emitEvent('error', RTCError.DATA_ERROR, errorEvent.error)
    );

    dataChannel.addEventListener('message', messageEvent =>
      emitEvent('data', JSON.parse(messageEvent.data))
    );

    dataChannel.addEventListener('open', () =>
      emitEvent('connectionestablished')
    );

    dataChannel.addEventListener('close', () =>
      emitEvent('connectionterminated')
    );
  });

  socket.on(
    'controller-description',
    (controllerId: string, description: RTCSessionDescription) => {
      if (description.type === 'answer') {
        connections[controllerId].connection.setRemoteDescription(description);
      } else {
        emitEvent(
          'error',
          RTCError.UNSUPPORTED_SDP,
          ERROR_MESSAGES[RTCError.UNSUPPORTED_SDP]
        );
      }
    }
  );

  socket.on(
    'controller-ice-candidate',
    (controllerId: string, icecandidate: RTCIceCandidate) => {
      connections[controllerId].connection.addIceCandidate(icecandidate);
    }
  );

  return {
    addEventListener: (event: EventType, listener: Function) => {
      if (!listeners[event]) {
        listeners = {
          ...listeners,
          [event]: [listener],
        };
      } else {
        listeners = {
          ...listeners,
          [event]: [...listeners[event], listener],
        };
      }
    },
    getController: (controllerId: string) => ({
      send: (type: string, ...params: any[]) =>
        connections[controllerId].dataChannel.send(
          JSON.stringify({ type, ...params })
        ),
    }),
  };
}
