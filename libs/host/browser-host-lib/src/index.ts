import { connect as rtcConnect } from '@timberwolf/js-host-lib';

export function connect(signalling: string) {
  return rtcConnect(RTCPeerConnection)(signalling);
}
