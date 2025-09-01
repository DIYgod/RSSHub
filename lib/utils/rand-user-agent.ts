import { HeaderGenerator, PRESETS } from 'header-generator';

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

    // Apply the same filtering logic as before for unwanted UAs
    if (browser === 'chrome') {
        let attempts = 0;
        while ((UA.includes('Chrome-Lighthouse') || UA.includes('Gener8') || UA.includes('HeadlessChrome') || UA.includes('SMTBot') || UA.includes('Electron') || UA.includes('Code')) && attempts < 10) {
            headers = generator.getHeaders();
            UA = headers['user-agent'];
            attempts++;
        }
    }
    if (browser === 'safari') {
        let attempts = 0;
        while (UA.includes('Applebot') && attempts < 10) {
            headers = generator.getHeaders();
            UA = headers['user-agent'];
            attempts++;
        }
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
    if (browser === 'chrome') {
        let attempts = 0;
        while (
            (headers['user-agent'].includes('Chrome-Lighthouse') ||
                headers['user-agent'].includes('Gener8') ||
                headers['user-agent'].includes('HeadlessChrome') ||
                headers['user-agent'].includes('SMTBot') ||
                headers['user-agent'].includes('Electron') ||
                headers['user-agent'].includes('Code')) &&
            attempts < 10
        ) {
            headers = generator.getHeaders();
            attempts++;
        }
    }
    if (browser === 'safari') {
        let attempts = 0;
        while (headers['user-agent'].includes('Applebot') && attempts < 10) {
            headers = generator.getHeaders();
            attempts++;
        }
    }

    return headers;
};

export default _randUserAgent;
