import io from 'socket.io-client';
import Controller, { CommsType, EventType } from './Controller';

export default class PeerController extends Controller {
  private peerConnection?: RTCPeerConnection;
  private dataChannel?: RTCDataChannel;

  constructor(url: string) {
    super(url, CommsType.Peer);
  }

  public connect(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.dataChannel = this.peerConnection.createDataChannel('data', {
      ordered: false,
    });

    const socket = io(this.url);

    socket.on('connect_error', (error: any) =>
      this.emitEvent(EventType.Error, error)
    );
    socket.on('connect_timeout', (error: any) =>
      this.emitEvent(EventType.Error, error)
    );
    socket.on('signalling_error', (...args: any[]) =>
      this.emitEvent(EventType.Error, ...args)
    );

    this.peerConnection.addEventListener('negotiationneeded', async () => {
      try {
        if (!!this.peerConnection) {
          (await this.peerConnection) &&
            this.peerConnection.setLocalDescription(
              await this.peerConnection.createOffer()
            );
          socket.emit(
            'controller-description',
            this.peerConnection.localDescription
          );
        }
      } catch (error) {
        this.emitEvent(EventType.Error, error);
      }
    });

    this.peerConnection.addEventListener('icecandidate', ({ candidate }) => {
      socket.emit('controller-ice-candidate', candidate);
    });

    socket.on(
      'host-description',
      async (description: RTCSessionDescription) => {
        if (description.type === 'offer') {
          if (!!this.peerConnection) {
            await this.peerConnection.setRemoteDescription(description);
            await this.peerConnection.setLocalDescription(
              await this.peerConnection.createAnswer()
            );
            socket.emit(
              'controller-description',
              this.peerConnection.localDescription
            );
          }
        } else if (description.type === 'answer') {
          if (!!this.peerConnection) {
            await this.peerConnection.setRemoteDescription(description);
          }
        } else {
          this.emitEvent(
            EventType.Error,
            `Unsupported UDP type: ${description.type}`
          );
        }
      }
    );

    socket.on('host-ice-candidate', async (candidate: RTCIceCandidate) => {
      if (!!this.peerConnection) {
        if (!!candidate) {
          this.peerConnection.addIceCandidate(candidate);
        }
      }
    });

    this.dataChannel.addEventListener('error', (errorEvent: RTCErrorEvent) => {
      this.emitEvent(EventType.Error, errorEvent.error);
    });

    this.dataChannel.addEventListener(
      'message',
      (messageEvent: MessageEvent) => {
        const data = JSON.parse(messageEvent.data) as any[];
        this.emitEvent(EventType.Message, ...data);
      }
    );

    this.dataChannel.addEventListener('open', () => {
      this.emitEvent(EventType.Connected);
    });

    this.peerConnection.addEventListener('iceconnectionstatechange', () => {
      if (
        this.peerConnection &&
        this.peerConnection.iceConnectionState === 'disconnected'
      ) {
        this.emitEvent(EventType.Disconnected);
      }
    });
  }

  public send(...args: any[]): void {
    if (!!this.dataChannel) {
      this.dataChannel.send(JSON.stringify(args));
    }
  }
}
