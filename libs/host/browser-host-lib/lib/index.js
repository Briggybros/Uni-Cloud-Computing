"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;

var _jsHostLib = require("@timberwolf/js-host-lib");

function connect(signalling) {
  return (0, _jsHostLib.connect)(RTCPeerConnection)(signalling);
}