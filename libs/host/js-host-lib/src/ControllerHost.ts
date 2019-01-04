export enum EventType {
  Error = 'Error',
  Input = 'Input',
  ControllerConnected = 'ControllerConnected',
  ControllerDisconnected = 'ControllerDisconnected',
}

export enum CommsType {
  Peer = 'Peer',
  Relay = 'Relay',
}

export type EventCallback = (...parts: any[]) => void;

export default abstract class ControllerHost {
  public readonly commsType: CommsType;

  public readonly roomCode: string;
  protected readonly url: string;
  protected readonly hostKey: string;

  private callbacks: { [eventType: string]: EventCallback[] } = {};

  constructor(
    roomCode: string,
    url: string,
    hostKey: string,
    commsType: CommsType
  ) {
    this.roomCode = roomCode;
    this.url = url;
    this.hostKey = hostKey;
    this.commsType = commsType;
  }

  public abstract connect(): void;
  public abstract broadcast(...args: any[]): void;
  public abstract message(controllerId: string, ...args: any[]): void;

  public addEventListener(eventType: EventType, callback: EventCallback): void {
    if (this.callbacks.hasOwnProperty(eventType)) {
      this.callbacks[eventType] = [...this.callbacks[eventType], callback];
    } else {
      this.callbacks[eventType] = [callback];
    }
  }

  protected emitEvent(eventType: EventType, ...parts: any[]): void {
    if (this.callbacks.hasOwnProperty(eventType)) {
      this.callbacks[eventType].forEach(callback => callback(...parts));
    }
  }
}
