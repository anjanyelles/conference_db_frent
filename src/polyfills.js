// Polyfills for browser environment
import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
window.process = {
  env: {},
  version: '',
  nextTick: function (callback) {
    setTimeout(callback, 0);
  }
};