import io from 'socket.io-client';

type EventType = 'data';

interface Controller {
  addEventListener: (
    event: string,
    callback: (...params: any[]) => any
  ) => void;
  send: (type: string, ...params: any[]) => void;
}

interface Connection {
  addEventListener: (
    event: string,
    callback: (...params: any[]) => any
  ) => void;
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
    addEventListener: (
      event: string,
      callback: (...params: any[]) => any
    ) => {},
    getController: (controllerId: string) => ({
      addEventListener: (
        event: string,
        callback: (...params: any[]) => any
      ) => {},
      send: (type: string, ...params: any[]) =>
        connections[controllerId].dataChannel.send(JSON.stringify(params)),
    }),
  };
}
