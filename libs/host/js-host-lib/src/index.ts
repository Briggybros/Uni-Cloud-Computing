// @ts-ignore
import io from 'socket.io-client';
import '@babel/polyfill';

const LOGGING = false;
const HOST_KEY = '';

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

export interface Connection {
  addEventListener: (event: EventType, callback: Function) => void;
  getController: (controllerId: string) => Controller;
}

let connections: {
  [controllerId: string]: {
    connection: RTCPeerConnection;
    dataChannel?: RTCDataChannel;
  };
} = {};

export function connect(rtcPeerConnection: {
  new (configuration?: RTCConfiguration | undefined): RTCPeerConnection;
  prototype: RTCPeerConnection;
  generateCertificate(
    keygenAlgorithm: AlgorithmIdentifier
  ): Promise<RTCCertificate>;
  getDefaultIceServers(): RTCIceServer[];
}) {
  return (signalling: string): Connection => {
    LOGGING && console.log('Connecting to signalling');
    const socket = io(signalling);

    let listeners: { [event: string]: Function[] } = {};
    function emitEvent(event: EventType, ...params: any[]) {
      LOGGING && console.log('emitting event: ', event, params);
      if (event === 'error') LOGGING && console.trace();
      if (listeners[event]) {
        listeners[event].forEach(listener => listener(...params));
      }
    }

    socket.on('signalling_error', (error: string, message: string) =>
      emitEvent('error', error, message)
    );

    LOGGING && console.log('Registering host');
    socket.emit('register-host', HOST_KEY);

    socket.on(
      'controller-description',
      async (controllerId: string, description: any) => {
        LOGGING && console.log('Received controller description');
        if (!connections[controllerId]) {
          LOGGING && console.log('Controller is new');
          const connection = new rtcPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          });

          connections = {
            ...connections,
            [controllerId]: { connection },
          };

          connection.addEventListener('datachannel', ({ channel }) => {
            channel.addEventListener('error', err => emitEvent('error', err));
            channel.addEventListener('open', () =>
              emitEvent('connectionestablished')
            );
            channel.addEventListener('close', () =>
              emitEvent('connectionterminated')
            );
            channel.addEventListener('message', ev => {
              const { type, ...params } = JSON.parse(ev.data);
              return emitEvent('data', controllerId, type, params);
            });

            connections = {
              ...connections,
              [controllerId]: {
                ...connections[controllerId],
                dataChannel: channel,
              },
            };
          });

          connection.addEventListener('icecandidate', ({ candidate }) => {
            LOGGING && console.log('Ice candidate found');
            socket.emit('host-ice-candidiate', controllerId, candidate);
          });
        }

        if (description.type === 'offer') {
          LOGGING && console.log('Description was offer');
          await connections[controllerId].connection.setRemoteDescription(
            description
          );
          await connections[controllerId].connection.setLocalDescription(
            await connections[controllerId].connection.createAnswer()
          );
          LOGGING && console.log('Sending answer');
          socket.emit(
            'host-description',
            controllerId,
            connections[controllerId].connection.localDescription
          );
        } else if (description.type === 'answer') {
          LOGGING && console.log('Description was answer');
          await connections[controllerId].connection.setRemoteDescription(
            description
          );
        } else {
          console.log('Unsupported SDP type.');
        }
      }
    );

    socket.on(
      'controller-ice-candidate',
      (controllerId: string, icecandidate: any) => {
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
        send: (type: string, ...params: any[]) => {
          const dataChannel = connections[controllerId].dataChannel;
          dataChannel
            ? dataChannel.send(JSON.stringify({ type, params }))
            : emitEvent('error', 'No established data channel');
        },
      }),
    };
  };
}
