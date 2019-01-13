import { RTCPeerConnection } from 'wrtc';
import { w3cwebsocket } from 'websocket';
import getControllerHost from '@timberwolf/js-host-lib';

(global as any).RTCPeerConnection = RTCPeerConnection;
(global as any).WebSocket = w3cwebsocket;

export { CommsType } from '@timberwolf/js-host-lib';
export default getControllerHost;
