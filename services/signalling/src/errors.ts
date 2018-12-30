import { Socket } from 'socket.io';

export enum Error {
  INVALID_HOST_KEY = 'INVALID_HOST_KEY',
  INCORRECT_MODE = 'INCORRECT_MODE',
  EXISTING_HOST = 'EXISTING_HOST',
  SELF_HOST = 'SELF_HOST',
  NO_HOST = 'NO_HOST',
  NO_CONTROLLER = 'NO_CONTROLLER',
}

const messages: { [error: string]: string } = {
  [Error.INVALID_HOST_KEY]: 'invalid host key',
  [Error.INCORRECT_MODE]: 'mode is not correct for this operation',
  [Error.EXISTING_HOST]: 'host already present',
  [Error.SELF_HOST]: 'you are the host',
  [Error.NO_HOST]: 'no host present',
  [Error.NO_CONTROLLER]:
    'controller with specified id does not exist or has disconnected',
};

export function sendError(socket: Socket, error: Error) {
  return socket.emit('signalling_error', error, messages[error]);
}
