import io from 'socket.io-client';
import Controller, { CommsType, EventType } from './Controller';

export default class RelayController extends Controller {
  private socket?: SocketIOClient.Socket;

  constructor(url: string) {
    super(url, CommsType.Relay);
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
      this.emitEvent(EventType.Error, args)
    );

    this.socket.on('connect', () => {
      this.socket && this.socket.emit('controller-description');
      this.emitEvent(EventType.Connected);
    });
    this.socket.on('disconnect', () => this.emitEvent(EventType.Disconnected));

    this.socket.on('message', (...args: any) => {
      this.emitEvent(EventType.Message, ...args);
    });
  }

  public send(...args: any[]): void {
    this.socket && this.socket.emit('controller-input', ...args);
  }
}
