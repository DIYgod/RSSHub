import { HeaderGenerator, PRESETS } from 'header-generator';

/**
 * Checks if a generated user agent is valid (doesn't contain unwanted strings)
 *
 * @param {string} userAgent The user agent string to validate
 * @param {string} browser The browser type (used to determine which filters to apply)
 * @returns {boolean} True if the user agent is valid, false if it contains unwanted strings
 */
const isValidUserAgent = (userAgent: string, browser: string): boolean => {
    browser = browser.toLowerCase();

    if (browser === 'chrome') {
        return !(userAgent.includes('Chrome-Lighthouse') || userAgent.includes('Gener8') || userAgent.includes('HeadlessChrome') || userAgent.includes('SMTBot') || userAgent.includes('Electron') || userAgent.includes('Code'));
    }

    if (browser === 'safari') {
        return !userAgent.includes('Applebot');
    }

    return true;
};

/**
 * A handy function to help generate a legit useragent with realistic headers.
 *
 * @param {Object} randUserAgent
 * @param {string} randUserAgent.browser Name of a browser, case-insensitive. `chrome`, `edge`, `firefox`, `mobile safari`(ios only) or `safari`.
 * @param {string} randUserAgent.os Name of an OS, case-insensitive. `android`, `ios`, `mac os`, `linux` or `windows`.
 * @param {string} randUserAgent.device Name of a device, case-insensitive. `desktop`, `mobile` or `tablet`.
 * @returns A random useragent for the given specifications.
 */
const _randUserAgent = ({ browser = 'chrome', os = 'mac os', device = 'desktop' }: { browser: string; os: string; device: string }) => {
    device = device.toLowerCase();
    browser = browser.toLowerCase();
    os = os.toLowerCase();

    // Map parameters to header-generator presets
    let preset = PRESETS.MODERN_DESKTOP;

    if (device === 'mobile' && os === 'android') {
        preset = PRESETS.MODERN_ANDROID;
    } else if (device === 'mobile') {
        preset = PRESETS.MODERN_MOBILE;
    } else if (browser === 'chrome') {
        switch (os) {
            case 'mac os':
            case 'macos':
                preset = PRESETS.MODERN_MACOS_CHROME;

                break;

            case 'windows':
                preset = PRESETS.MODERN_WINDOWS_CHROME;

                break;

            case 'linux':
                preset = PRESETS.MODERN_LINUX_CHROME;

                break;

            default:
                preset = PRESETS.MODERN_DESKTOP;
        }
    } else if (browser === 'firefox') {
        switch (os) {
            case 'mac os':
            case 'macos':
                preset = PRESETS.MODERN_MACOS_FIREFOX;

                break;

            case 'windows':
                preset = PRESETS.MODERN_WINDOWS_FIREFOX;

                break;

            case 'linux':
                preset = PRESETS.MODERN_LINUX_FIREFOX;

                break;

            default:
                preset = PRESETS.MODERN_DESKTOP;
        }
    }

    const generator = new HeaderGenerator(preset);
    let headers = generator.getHeaders();
    let UA = headers['user-agent'];

    // Apply filtering logic for unwanted UAs
    let attempts = 0;
    while (!isValidUserAgent(UA, browser) && attempts < 10) {
        headers = generator.getHeaders();
        UA = headers['user-agent'];
        attempts++;
    }

    return UA;
};

/**
 * Generate full headers including sec-ch-* and sec-fetch-* headers
 *
 * @param {Object} options Browser options
 * @returns Headers object with user-agent and additional headers
 */
export const generateHeaders = ({ browser = 'chrome', os = 'mac os', device = 'desktop' }: { browser: string; os: string; device: string }) => {
    device = device.toLowerCase();
    browser = browser.toLowerCase();
    os = os.toLowerCase();

    // Map parameters to header-generator presets
    let preset = PRESETS.MODERN_DESKTOP;

    if (device === 'mobile' && os === 'android') {
        preset = PRESETS.MODERN_ANDROID;
    } else if (device === 'mobile') {
        preset = PRESETS.MODERN_MOBILE;
    } else if (browser === 'chrome') {
        switch (os) {
            case 'mac os':
            case 'macos':
                preset = PRESETS.MODERN_MACOS_CHROME;

                break;

            case 'windows':
                preset = PRESETS.MODERN_WINDOWS_CHROME;

                break;

            case 'linux':
                preset = PRESETS.MODERN_LINUX_CHROME;

                break;

            default:
                preset = PRESETS.MODERN_DESKTOP;
        }
    } else if (browser === 'firefox') {
        switch (os) {
            case 'mac os':
            case 'macos':
                preset = PRESETS.MODERN_MACOS_FIREFOX;

                break;

            case 'windows':
                preset = PRESETS.MODERN_WINDOWS_FIREFOX;

                break;

            case 'linux':
                preset = PRESETS.MODERN_LINUX_FIREFOX;

                break;

            default:
                preset = PRESETS.MODERN_DESKTOP;
        }
    }

    const generator = new HeaderGenerator(preset);
    let headers = generator.getHeaders();

    // Apply filtering logic for unwanted UAs
    let attempts = 0;
    while (!isValidUserAgent(headers['user-agent'], browser) && attempts < 10) {
        headers = generator.getHeaders();
        attempts++;
    }

    return headers;
};

export default _randUserAgent;
