import type { HeaderGeneratorOptions } from 'header-generator';
import { HeaderGenerator, PRESETS } from 'header-generator';

export { PRESETS } from 'header-generator';

/**
 * Checks if the generated headers are valid (no unwanted UA strings, required headers present)
 *
 * @param {Record<string, string>} headers The generated headers to validate
 * @param {string} browser The browser type (used to determine which filters to apply)
 * @returns {boolean} True if the headers are valid
 */
const isValidHeader = (headers: Record<string, string>, browser: string): boolean => {
    browser = browser.toLowerCase();
    const userAgent = headers['user-agent'];

    if (
        browser === 'chrome' &&
        (userAgent.includes('Chrome-Lighthouse') ||
            userAgent.includes('Gener8') ||
            userAgent.includes('HeadlessChrome') ||
            userAgent.includes('SMTBot') ||
            userAgent.includes('Electron') ||
            userAgent.includes('Code') ||
            !(headers['sec-ch-ua'] && headers['sec-ch-ua-mobile'] && headers['sec-ch-ua-platform']))
    ) {
        return false;
    }

    return !(browser === 'safari' && userAgent.includes('Applebot'));
};

/**
 * @param {Partial<HeaderGeneratorOptions>} preset Preset from header-generator package (defaults to PRESETS.MODERN_MACOS_CHROME)
 * @returns Headers object with user-agent and additional headers
 */
// Cache for HeaderGenerator instances per preset
const generatorCache = new Map<string, HeaderGenerator>();

// The browsers header-generator has data for, as browserslist names them
const browserNames = ['chrome', 'edge', 'firefox', 'safari'] as const;

/**
 * A generator for the browsers of a preset's `browserListQuery`, in any version header-generator knows.
 * browserslist resolves the query from caniuse-lite, which can name newer versions than header-generator's
 * data has (when neither is pinned to the other, as in an install of the npm package), and a generator
 * for those makes no headers at all.
 */
const relaxedGenerator = ({ browserListQuery = '', ...preset }: Partial<HeaderGeneratorOptions>) => {
    const query = browserListQuery.toLowerCase();
    const browsers = browserNames.filter((name) => query.includes(name));
    return new HeaderGenerator(browsers.length ? { ...preset, browsers: [...browsers] } : preset);
};

export const generateHeaders = (preset: Partial<HeaderGeneratorOptions> = PRESETS.MODERN_MACOS_CHROME) => {
    const cacheKey = JSON.stringify(preset);
    let generator = generatorCache.get(cacheKey);
    if (!generator) {
        generator = new HeaderGenerator(preset);
        generatorCache.set(cacheKey, generator);
    }
    let headers: ReturnType<HeaderGenerator['getHeaders']>;
    try {
        headers = generator.getHeaders();
    } catch (error) {
        if (!preset.browserListQuery) {
            throw error;
        }
        generator = relaxedGenerator(preset);
        generatorCache.set(cacheKey, generator);
        headers = generator.getHeaders();
    }

    const userAgent = headers['user-agent'];
    let detectedBrowser: string;
    if (userAgent.includes('Firefox')) {
        detectedBrowser = 'firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        detectedBrowser = 'safari';
    } else {
        detectedBrowser = 'chrome';
    }

    let attempts = 0;
    while (!isValidHeader(headers, detectedBrowser) && attempts < 10) {
        headers = generator.getHeaders();
        attempts++;
    }

    return headers;
};

/** List of headers to include from header-generator output
 * excluding headers that are typically set manually or by the environment
 */
export const generatedHeaders = new Set([
    // 'content-length',
    // 'cache-control',
    // sec-ch-ua (chrome client hints)
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-ch-ua-platform',
    // 'origin',
    // 'content-type',
    'upgrade-insecure-requests',
    // 'user-agent', // handle manually
    'accept',
    // sec-fetch (fetch metadata)
    'sec-fetch-site',
    'sec-fetch-mode',
    'sec-fetch-user',
    'sec-fetch-dest',
    // 'referer', // handle manually
    'accept-encoding',
    'accept-language',
    // 'cookie',
    'priority',
]);
