import getControllerHost, { CommsType } from '@timberwolf/node-host-lib';
import { EventType } from '@timberwolf/js-host-lib/lib/ControllerHost';

async function start() {
  console.log('Attempting to start host');
  let controllerHost;

  try {
    controllerHost = await getControllerHost(CommsType.Peer);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }

  console.log('Host started');
  console.log('code: ', controllerHost.roomCode);

  controllerHost.addEventListener(EventType.ControllerConnected, () => {
    console.log('Controller connected');
  });

  controllerHost.addEventListener(EventType.ControllerDisconnected, () => {
    console.log('Controller disconnected');
  });

  controllerHost.addEventListener(EventType.Error, console.error);

  controllerHost.addEventListener(
    EventType.Input,
    (controllerId: string, ...args: any[]) => {
      console.log(`data received from ${controllerId}`);
      console.log('args: ', args);
    }
  );

  controllerHost.connect();
}
start();
