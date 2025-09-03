import { HeaderGenerator, PRESETS } from 'header-generator';

// Re-export PRESETS for convenience
export { PRESETS } from 'header-generator';

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
 * Generate full headers including sec-ch-* and sec-fetch-* headers
 *
 * @param {Object} options Browser options or preset
 * @param {any} options.preset Direct header-generator preset to use (takes precedence over browser/os/device)
 * @param {string} options.browser Name of a browser, case-insensitive. `chrome`, `edge`, `firefox`, `mobile safari`(ios only) or `safari`.
 * @param {string} options.os Name of an OS, case-insensitive. `android`, `ios`, `mac os`, `linux` or `windows`.
 * @param {string} options.device Name of a device, case-insensitive. `desktop`, `mobile` or `tablet`.
 * @returns Headers object with user-agent and additional headers
 */
export const generateHeaders = ({ preset, browser = 'chrome', os = 'mac os', device = 'desktop' }: { preset?: any; browser?: string; os?: string; device?: string } = {}) => {
    let finalPreset = preset;

    // If no preset is provided, map parameters to header-generator presets
    if (!finalPreset) {
        device = device.toLowerCase();
        browser = browser.toLowerCase();
        os = os.toLowerCase();

        finalPreset = PRESETS.MODERN_MACOS_CHROME; // Default preset as requested

        if (device === 'mobile' && os === 'android') {
            finalPreset = PRESETS.MODERN_ANDROID;
        } else if (device === 'mobile') {
            finalPreset = PRESETS.MODERN_MOBILE;
        } else if (browser === 'chrome') {
            switch (os) {
                case 'mac os':
                case 'macos':
                    finalPreset = PRESETS.MODERN_MACOS_CHROME;

                    break;

                case 'windows':
                    finalPreset = PRESETS.MODERN_WINDOWS_CHROME;

                    break;

                case 'linux':
                    finalPreset = PRESETS.MODERN_LINUX_CHROME;

                    break;

                default:
                    finalPreset = PRESETS.MODERN_MACOS_CHROME;
            }
        } else if (browser === 'firefox') {
            switch (os) {
                case 'mac os':
                case 'macos':
                    finalPreset = PRESETS.MODERN_MACOS_FIREFOX;

                    break;

                case 'windows':
                    finalPreset = PRESETS.MODERN_WINDOWS_FIREFOX;

                    break;

                case 'linux':
                    finalPreset = PRESETS.MODERN_LINUX_FIREFOX;

                    break;

                default:
                    finalPreset = PRESETS.MODERN_MACOS_CHROME;
            }
        }
    }

    const generator = new HeaderGenerator(finalPreset);
    let headers = generator.getHeaders();

    // Apply filtering logic for unwanted UAs
    let attempts = 0;
    while (!isValidUserAgent(headers['user-agent'], browser || 'chrome') && attempts < 10) {
        headers = generator.getHeaders();
        attempts++;
    }

    return headers;
};
