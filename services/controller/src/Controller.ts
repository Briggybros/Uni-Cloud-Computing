export enum EventType {
  Error = 'Error',
  Message = 'Message',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
}

export enum CommsType {
  Peer = 'Peer',
  Relay = 'Relay',
}

export type EventCallback = (...parts: any[]) => void;

export default abstract class Controller {
  public readonly commsType: CommsType;
  public readonly controllerId: string;
  protected readonly url: string;

  private callbacks: { [eventType: string]: EventCallback[] } = {};

  constructor(url: string, commsType: CommsType, controllerId: string) {
    this.url = url;
    this.commsType = commsType;
    this.controllerId = controllerId;
  }

  public abstract connect(): void;
  public abstract send(...args: any[]): void;

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
