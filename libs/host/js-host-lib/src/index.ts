import '@babel/polyfill';

import ControllerHost, { CommsType } from './ControllerHost';
import PeerControllerHost from './PeerControllerHost';
import RelayControllerHost from './RelayControllerHost';

export { CommsType } from './ControllerHost';

export default async function getControllerHost(
  commsType: CommsType
): Promise<ControllerHost> {
  const { code, hostKey, ip } = await new Promise((resolve, reject) => {
    const socket = new WebSocket(
      'wss://8zvz2j2xp8.execute-api.us-east-2.amazonaws.com/prod'
    );

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ action: 'requestSignallingServer' }));
    });

    socket.addEventListener('error', event => {
      reject(event);
    });

    socket.addEventListener('close', () => {
      reject('socket closed');
    });

    socket.addEventListener('message', event => {
      const response = JSON.parse(event.data);
      if (response.code === 201) {
        resolve(response.body);
      }
    });
  });

  switch (commsType) {
    case CommsType.Peer:
      return new PeerControllerHost(code, `http://${ip}`, hostKey);
    case CommsType.Relay:
      return new RelayControllerHost(code, `http://${ip}`, hostKey);
    default:
      return new RelayControllerHost(code, `http://${ip}`, hostKey);
  }
}
