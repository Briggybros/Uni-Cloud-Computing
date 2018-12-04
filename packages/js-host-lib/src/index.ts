import io from 'socket.io-client';

type EventType = 'data';

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
      console.error(error);
    }

    dataChannel.addEventListener('message', messageEvent =>
      emitEvent('data', JSON.parse(messageEvent.data))
    );
  });

  socket.on(
    'controller-description',
    (controllerId: string, description: RTCSessionDescription) => {
      if (description.type === 'answer') {
        connections[controllerId].connection.setRemoteDescription(description);
      } else {
        console.error('unsupported SDP type');
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
