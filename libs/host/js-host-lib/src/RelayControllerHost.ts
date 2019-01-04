import io from 'socket.io-client';

import ControllerHost, { CommsType, EventType } from './ControllerHost';

export default class RelayControllerHost extends ControllerHost {
  private socket?: SocketIOClient.Socket;

  constructor(roomCode: string, url: string, hostKey: string) {
    super(roomCode, url, hostKey, CommsType.Relay);
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
        this.socket && this.socket.emit('register-host', 'relay', this.hostKey)
    );

    this.socket.on('controller-input', (...args: any[]) =>
      this.emitEvent(EventType.Input, ...args)
    );

    this.socket.on('controller-description', (controllerId: string) =>
      this.emitEvent(EventType.ControllerConnected, controllerId)
    );

    this.socket.on('controller-disconnected', (controllerId: string) =>
      this.emitEvent(EventType.ControllerDisconnected, controllerId)
    );
  }

  public broadcast(...args: any[]): void {
    if (!this.socket) return this.emitEvent(EventType.Error, `Not connected`);
    this.socket.emit('broadcast', ...args);
  }

  public message(controllerId: string, ...args: any[]): void {
    if (!this.socket) return this.emitEvent(EventType.Error, `Not connected`);
    this.socket.emit('message', controllerId, ...args);
  }
}
