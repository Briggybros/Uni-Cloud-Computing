import getControllerHost, { CommsType } from '@timberwolf/node-host-lib';
import { EventType } from '@timberwolf/js-host-lib/lib/ControllerHost';

setTimeout(async () => {
  const controllerHost = await getControllerHost(CommsType.Peer);

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
}, 10000);
