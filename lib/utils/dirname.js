import { URL } from 'url'; // in Browser, the URL in native accessible on window

// https://github.com/rhysd/dirname-filename-esm
// import.meta
export function __filename(imp) { return new URL('', imp.url).pathname; }
// Will contain trailing slash
export function __dirname(imp) { return new URL('.', imp.url).pathname; }