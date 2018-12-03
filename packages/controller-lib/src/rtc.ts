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

type Event =
  | 'error'
  | 'data'
  | 'connectionestablished'
  | 'connectionterminated';
type EventListener = (...params: any[]) => any;

interface GameHost {
  addEventListener: (event: Event, listener: EventListener) => void;
}

export function connect(signalling: string): GameHost {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });
  const dataChannel = peerConnection.createDataChannel('data', {
    ordered: false,
    maxPacketLifeTime: 1000,
  });
  const socket = io(signalling);
  let listeners: { [event: string]: EventListener[] } = {};
  function emitEvent(event: Event, ...params: any[]) {
    if (listeners[event])
      listeners.event.forEach(listener => listener(...params));
  }

  socket.on('error', (error: string, message: string) =>
    emitEvent('error', error, message)
  );

  socket.emit('controller-connect');

  socket.on('host-description', async (description: RTCSessionDescription) => {
    if (description.type === 'offer') {
      await peerConnection.setRemoteDescription(description);
      await peerConnection.setLocalDescription(
        await peerConnection.createAnswer()
      );
      socket.emit('controller-description', peerConnection.localDescription);
    } else {
      emitEvent(
        'error',
        RTCError.UNSUPPORTED_SDP,
        ERROR_MESSAGES[RTCError.UNSUPPORTED_SDP]
      );
    }
  });
  socket.on('host-ice-candidate', async (icecandidate: RTCIceCandidate) => {
    await peerConnection.addIceCandidate(icecandidate);
  });

  peerConnection.addEventListener('icecandidate', ({ candidate }) =>
    socket.emit('controller-ice-candidate', candidate)
  );

  /** Should never be used, but is nice to have in case */
  peerConnection.addEventListener('negotiationneeded', async () => {
    try {
      await peerConnection.setLocalDescription(
        await peerConnection.createOffer()
      );
      socket.emit('controller-description', peerConnection.localDescription);
    } catch (error) {
      emitEvent(
        'error',
        RTCError.NEGOTIATION_ERROR,
        error.message || ERROR_MESSAGES[RTCError.NEGOTIATION_ERROR]
      );
    }
  });

  dataChannel.addEventListener('error', (errorEvent: RTCErrorEvent) =>
    emitEvent('error', RTCError.DATA_ERROR, errorEvent.error)
  );

  dataChannel.addEventListener('message', messageEvent =>
    emitEvent('data', messageEvent.data)
  );

  dataChannel.addEventListener('open', () =>
    emitEvent('connectionestablished')
  );

  dataChannel.addEventListener('close', () =>
    emitEvent('connectionterminated')
  );

  return {
    addEventListener: (event: Event, listener: EventListener) => {
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
  };
}
