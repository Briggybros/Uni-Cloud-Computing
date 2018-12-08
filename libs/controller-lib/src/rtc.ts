import io from 'socket.io-client';

const LOGGING = false;

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

interface GameHost {
  addEventListener: (event: EventType, listener: Function) => void;
  send: (type: string, ...params: any[]) => void;
}

export function connect(signalling: string): GameHost {
  LOGGING && console.log('Creating peer connection');

  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  LOGGING && console.log('Creating data channel');
  const dataChannel = peerConnection.createDataChannel('data', {
    ordered: false,
  });

  LOGGING && console.log('Connecting to signalling');
  const socket = io(signalling);

  let listeners: { [event: string]: Function[] } = {};
  function emitEvent(event: EventType, ...params: any[]) {
    LOGGING && console.log('emitting event: ', event, params);
    if (listeners[event]) {
      listeners[event].forEach(listener => listener(...params));
    }
  }

  socket.on('signalling_error', (error: string, message: string) =>
    emitEvent('error', error, message)
  );

  LOGGING && console.log('Attempting to connect to host');

  peerConnection.addEventListener('negotiationneeded', async () => {
    LOGGING && console.log('Negotiation needed');
    try {
      await peerConnection.setLocalDescription(
        await peerConnection.createOffer()
      );
      LOGGING && console.log('Sending offer');
      socket.emit('controller-description', peerConnection.localDescription);
    } catch (err) {
      emitEvent('error', err);
    }
  });

  peerConnection.addEventListener('icecandidate', ({ candidate }) => {
    LOGGING && console.log('Ice candidate found');
    socket.emit('controller-ice-candidiate', candidate);
  });

  socket.on(
    'host-description',
    async (description: RTCSessionDescriptionInit) => {
      LOGGING && console.log('Received host description');
      if (description.type === 'offer') {
        LOGGING && console.log('Description was offer');
        await peerConnection.setRemoteDescription(description);
        await peerConnection.setLocalDescription(
          await peerConnection.createAnswer()
        );
        socket.emit('controller-description', peerConnection.localDescription);
      } else if (description.type === 'answer') {
        LOGGING && console.log('Description was answer');
        await peerConnection.setRemoteDescription(description);
      } else {
        console.log('Unsupported SDP type.');
      }
    }
  );

  socket.on('host-ice-candidate', async (candidate: RTCIceCandidate) => {
    LOGGING && console.log('Host ice candidate received');
    peerConnection.addIceCandidate(candidate);
  });

  dataChannel.addEventListener('error', (errorEvent: RTCErrorEvent) =>
    emitEvent('error', RTCError.DATA_ERROR, errorEvent.error)
  );

  dataChannel.addEventListener('message', messageEvent => {
    const { type, ...params } = JSON.parse(messageEvent.data);
    return emitEvent('data', type, ...params);
  });

  dataChannel.addEventListener('open', () =>
    emitEvent('connectionestablished')
  );

  dataChannel.addEventListener('close', () =>
    emitEvent('connectionterminated')
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
    send: (type: string, ...params: any[]) => {
      LOGGING && console.log('Sending message', type, params);
      dataChannel.send(JSON.stringify({ type, params }));
    },
  };
}
