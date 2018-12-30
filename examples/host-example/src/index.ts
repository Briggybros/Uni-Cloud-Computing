import getControllerHost, { CommsType } from '@timberwolf/node-host-lib';
import { EventType } from '@timberwolf/js-host-lib/lib/ControllerHost';

let count = 0;

console.log(`Game started with count=${count}`);

setTimeout(() => {
  const controllerHost = getControllerHost(
    CommsType.Relay,
    'http://localhost:8081',
    ''
  );

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
      count = count + 1;
      console.log(`Count updated! count=${count}`);
    }
  );

  controllerHost.connect();
}, 10000);
