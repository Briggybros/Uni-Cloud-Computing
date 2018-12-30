import { RTCPeerConnection } from 'wrtc';
import getControllerHost from '@timberwolf/js-host-lib';

(global as any).RTCPeerConnection = RTCPeerConnection;

export { CommsType } from '@timberwolf/js-host-lib';
export default getControllerHost;