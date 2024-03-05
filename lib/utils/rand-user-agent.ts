import { randUserAgent } from '@tonyrl/rand-user-agent';

/**
 * A handy function to help generate a legit useragent.
 *
 * @param {Object} randUserAgent
 * @param {string} randUserAgent.browser Name of a browser, case-insensitive. `chrome`, `edge`, `firefox`, `mobile safari`(ios only) or `safari`.
 * @param {string} randUserAgent.os Name of an OS, case-insensitive. `android`, `ios`, `mac os`, `linux` or `windows`.
 * @param {string} randUserAgent.device Name of a device, case-insensitive. `desktop`, `mobile` or `tablet`.
 * @returns A random useragent for the given specifications.
 */
export default ({ browser = 'chrome', os = 'mac os', device = 'desktop' }) => {
    device = device.toLowerCase();
    browser = browser.toLowerCase();
    os = os.toLowerCase();
    let UA = randUserAgent(device, browser, os);

    if (browser === 'chrome') {
        while (UA.includes('Chrome-Lighthouse') || UA.includes('Gener8') || UA.includes('HeadlessChrome') || UA.includes('SMTBot') || UA.includes('Electron') || UA.includes('Code')) {
            UA = randUserAgent(device, browser, os);
        }
    }
    if (browser === 'safari') {
        while (UA.includes('Applebot')) {
            UA = randUserAgent(device, browser, os);
        }
    }
    return UA;
};
