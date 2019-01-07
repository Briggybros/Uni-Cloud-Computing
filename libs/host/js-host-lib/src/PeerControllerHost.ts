import ControllerHost, { CommsType, EventType } from './ControllerHost';
import io from 'socket.io-client';

interface Connections {
  [controllerId: string]: {
    connection: RTCPeerConnection;
    dataChannel?: RTCDataChannel;
  };
}
export default class PeerControllerHost extends ControllerHost {
  private socket?: SocketIOClient.Socket;
  private connections: Connections = {};

  constructor(roomCode: string, url: string, hostKey: string) {
    super(roomCode, url, hostKey, CommsType.Peer);
  }

  public connect(): void {
    this.socket = io(this.url);

    this.socket.on('connect_error', (error: any) =>
      this.emitEvent(EventType.Error, error)
    );

    this.socket.on('connect_timeout', (error: any) =>
      this.emitEvent(EventType.Error, error)
    );

    this.socket.on('signalling_error', (...args: any[]) =>
      this.emitEvent(EventType.Error, ...args)
    );

    this.socket.on(
      'connect',
      () =>
        this.socket && this.socket.emit('register-host', 'peer', this.hostKey)
    );

    this.socket.on(
      'controller-description',
      async (controllerId: string, description: RTCSessionDescription) => {
        if (!this.connections[controllerId]) {
          const connection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          });

          this.connections = {
            ...this.connections,
            [controllerId]: { connection },
          };

          connection.addEventListener('datachannel', ({ channel }) => {
            channel.addEventListener('error', error =>
              this.emitEvent(EventType.Error, error)
            );
            channel.addEventListener('open', () =>
              this.emitEvent(EventType.ControllerConnected, controllerId)
            );
            channel.addEventListener('message', ev => {
              const args = JSON.parse(ev.data) as any[];
              this.emitEvent(EventType.Input, controllerId, ...args);
            });

            this.connections = {
              ...this.connections,
              [controllerId]: {
                ...this.connections[controllerId],
                dataChannel: channel,
              },
            };
          });

          connection.addEventListener('icecandidate', ({ candidate }) => {
            this.socket &&
              this.socket.emit('host-ice-candidate', controllerId, candidate);
          });

          connection.addEventListener('iceconnectionstatechange', () => {
            if (connection.iceConnectionState === 'disconnected') {
              this.emitEvent(EventType.ControllerDisconnected, controllerId);
            }
          });
        }

        if (description.type === 'offer') {
          await this.connections[controllerId].connection.setRemoteDescription(
            description
          );
          await this.connections[controllerId].connection.setLocalDescription(
            await this.connections[controllerId].connection.createAnswer()
          );
          this.socket &&
            this.socket.emit(
              'host-description',
              controllerId,
              this.connections[controllerId].connection.localDescription
            );
        } else if (description.type === 'answer') {
          await this.connections[controllerId].connection.setRemoteDescription(
            description
          );
        } else {
          this.emitEvent(
            EventType.Error,
            `Unsupported SDP type: ${description.type}`
          );
        }
      }
    );

    this.socket.on(
      'controller-ice-candidate',
      (controllerId: string, candidate: RTCIceCandidate) => {
        const controller = this.connections[controllerId];
        if (!!controller && !!candidate) {
          controller.connection.addIceCandidate(candidate);
        }
      }
    );
  }

  public disconnect(): void {
    this.socket && this.socket.disconnect();
    Object.values(this.connections).forEach(pair => pair.connection.close());
  }

  public broadcast(...args: any[]): void {
    Object.values(this.connections).forEach(
      connection =>
        connection.dataChannel &&
        connection.dataChannel.send(JSON.stringify(args))
    );
  }

  public message(controllerId: string, ...args: any[]): void {
    const controller = this.connections[controllerId];
    if (!controller) {
      return this.emitEvent(EventType.Error, `Invalid controller`);
    }
    controller.dataChannel
      ? controller.dataChannel.send(JSON.stringify(args))
      : this.emitEvent(EventType.Error, `Bad data channel`);
  }
}
