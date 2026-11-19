import type { SecureVersion } from 'node:tls';

import type { HeaderGeneratorOptions } from 'header-generator';
import { createFetch } from 'ofetch';
import type { ZodType } from 'zod';

import { config } from '@/config';
import logger from '@/utils/logger';

declare module 'ofetch' {
    interface FetchOptions {
        headerGeneratorOptions?: Partial<HeaderGeneratorOptions>;
        /**
         * Set to false to disable undici 8's HTTP/2
         * @default true
         */
        allowH2?: boolean;
        /**
         * Minimum TLS version of the connection
         * @default tls.DEFAULT_MIN_VERSION ('TLSv1.2')
         */
        minVersion?: SecureVersion;
        /**
         * A string describing a named curve, TLS group, or
         * colon-separated list of named curves or TLS groups to use for key agreement,
         * for example `P-521:P-384:P-256`, `X25519`, or `X25519MLKEM768`. The
         * historical name of this option refers to ECDH key agreement in TLSv1.2 and
         * below. In TLSv1.3, this option configures the TLS Supported Groups and
         * key share groups offered or accepted by the TLS stack. Set to `auto` to
         * select the group automatically. Use `crypto.getCurves()` to obtain a
         * list of available elliptic curve names. For TLS group names, use
         * `openssl list -tls-groups` or consult the [IANA TLS Supported Groups
         * registry](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#tls-parameters-8).
         * Applies to proxied requests as well, unlike an explicitly passed `dispatcher`.
         */
        ecdhCurve?: string;
        /**
         * Parse the response data with this schema.
         * Only applied to successful (2xx) responses with a body.
         */
        schema?: ZodType;
        /**
         * Names of custom request headers that carry a credential, e.g. `X-Auth-Token`.
         * They are dropped when a redirect leaves the origin, like `Authorization` and `Cookie` always are
         */
        credentialHeaders?: string[];
        /**
         * Set to true to refuse loopback, private and other non-public addresses, including redirects to them.
         * For URLs taken from upstream content. No effect when `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` is enabled
         * @default false
         */
        publicOnly?: boolean;
        /**
         * Largest response body to accept, in bytes after `Content-Encoding` is decoded,
         * for a download that is known to be larger than the default
         * @default config.requestMaxResponseSize (`REQUEST_MAX_RESPONSE_SIZE`, 16 MiB)
         */
        maxResponseSize?: number;
    }
}

if (config.enableRemoteDebugging && process.env.NODE_ENV === 'dev') {
    const { register } = await import('node-network-devtools');
    register();
}

const rofetch = createFetch({ fetch: (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => fetch(input, init) }).create({
    retryStatusCodes: [400, 408, 409, 425, 429, 500, 502, 503, 504],
    retry: config.requestRetry,
    retryDelay: 1000,
    // timeout: config.requestTimeout,
    onResponseError({ request, response, options }) {
        if (!options.retry) {
            return;
        }

        logger.warn(`Request ${request} with error ${response.status} remaining retry attempts: ${options.retry}`);
        if (!(options.headers instanceof Headers)) {
            options.headers = new Headers(options.headers || {});
        }
        options.headers.set('x-prefer-proxy', '1');
    },
    onRequestError({ request, error }) {
        logger.error(`Request ${request} fail: ${error.cause} ${error}`);
        for (let cause: unknown = error.cause; cause instanceof Error; cause = cause.cause) {
            if (cause.message) {
                error.message += ` (${cause.message})`;
            }
        }
    },
    onResponse({ request, response, options }) {
        if (response.redirected) {
            logger.http(`Redirecting to ${response.url} for ${request}`);
        }
        if (options.schema && response.ok && response._data) {
            response._data = options.schema.parse(response._data);
        }
    },
});

export default rofetch;
