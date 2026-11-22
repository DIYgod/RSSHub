import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { RequestConfigOverrides } from '@/utils/request-config';
import { runWithRequestConfig } from '@/utils/request-config';

const headerName = 'X-RSSHub-Config';
const maxHeaderLength = 8192;

// Namespaces of the instance itself (storage, network, telemetry); only route namespaces can be set per request
const protectedNamespaces = new Set(['cache', 'memory', 'redis', 'httpCache', 'proxy', 'connect', 'otel', 'honeybadger', 'sentry', 'hotlink', 'feature']);

// Only credentials can be set per request, so a client can never redirect the instance to another host
const credentialKey = /cookie|token|secret|password|passwd|session|auth|key$/i;

// Options whose environment variable is a comma separated list
const listKeys = new Set(['twitter.authToken']);

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value !== '';

const normalizeValue = (path: string, value: unknown) => {
    if (listKeys.has(path)) {
        const list = typeof value === 'string' ? value.split(',') : value;
        if (!Array.isArray(list) || list.some((item) => typeof item !== 'string')) {
            throw new InvalidParameterError(`${headerName}: "${path}" must be a string or an array of strings.`);
        }
        const items = list.map((item) => item.trim()).filter(Boolean);
        if (items.length === 0) {
            throw new InvalidParameterError(`${headerName}: "${path}" must not be empty.`);
        }
        return items;
    }
    if (isNonEmptyString(value) || (isRecord(value) && Object.values(value).every((item) => isNonEmptyString(item)))) {
        return value;
    }
    throw new InvalidParameterError(`${headerName}: "${path}" must be a non-empty string or an object of non-empty strings.`);
};

const parseOverrides = (header: string): RequestConfigOverrides => {
    if (header.length > maxHeaderLength) {
        throw new InvalidParameterError(`${headerName} is too large.`);
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(header);
    } catch {
        throw new InvalidParameterError(`${headerName} must be valid JSON.`);
    }
    if (!isRecord(parsed)) {
        throw new InvalidParameterError(`${headerName} must be a JSON object such as {"twitter":{"authToken":"..."}}.`);
    }

    const instanceConfig = config as unknown as Record<string, unknown>;
    const overrides: RequestConfigOverrides = {};
    for (const [namespace, values] of Object.entries(parsed)) {
        const base = Object.hasOwn(instanceConfig, namespace) ? instanceConfig[namespace] : undefined;
        if (protectedNamespaces.has(namespace) || !isRecord(base) || !isRecord(values)) {
            throw new InvalidParameterError(`${headerName}: "${namespace}" cannot be set per request.`);
        }
        overrides[namespace] = {};
        for (const [key, value] of Object.entries(values)) {
            if (!Object.hasOwn(base, key) || !credentialKey.test(key)) {
                throw new InvalidParameterError(`${headerName}: "${namespace}.${key}" cannot be set per request.`);
            }
            overrides[namespace][key] = normalizeValue(`${namespace}.${key}`, value);
        }
    }
    return overrides;
};

// Lets the client of a self-hosted instance bring its own credentials, e.g.
// X-RSSHub-Config: {"twitter":{"authToken":"..."}}
// The values replace the instance's own for that request only and are never written to the shared config.
const middleware: MiddlewareHandler = async (ctx, next) => {
    const header = ctx.req.header(headerName);
    if (header === undefined) {
        await next();
        return;
    }
    // Without an access key anyone could spend the instance on credentials of their choice
    if (!config.allowRequestConfig || !config.accessKey) {
        throw new InvalidParameterError(`${headerName} is not enabled on this instance, set ALLOW_REQUEST_CONFIG=true together with ACCESS_KEY.`);
    }
    await runWithRequestConfig(parseOverrides(header), () => next());
};

export default middleware;
