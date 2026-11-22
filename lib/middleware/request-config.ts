import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { runWithRequestEnv } from '@/utils/request-config';

const headerName = 'X-RSSHub-Config';
const maxHeaderLength = 8192;

// Only names that end in a credential word (or the per-account cookie prefixes) may be sent, so a client cannot redirect the instance to another host
const credentialName = /^(?:[A-Z][A-Z0-9_]*(?:COOKIE|COOKIES|TOKEN|SECRET|PASSWORD|PASSWD|SESSION|SESSION_ID|AUTH|KEY)|(?:BILIBILI|DISCUZ|MEDIUM)_COOKIE_\w+)$/;
const instanceName = /^(?:ACCESS_KEY|ALLOW_REQUEST_CONFIG|REMOTE_CONFIG|CACHE_|MEMORY_|REDIS_|PROXY_|PAC_|OTEL_|SENTRY|HONEYBADGER|HOTLINK_|FEATURE_|TELEGRAM_PROXY_)/;

const parseEnv = (header: string) => {
    if (header.length > maxHeaderLength) {
        throw new InvalidParameterError(`${headerName} is too large.`);
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(header);
    } catch {
        throw new InvalidParameterError(`${headerName} must be valid JSON.`);
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new InvalidParameterError(`${headerName} must be a JSON object such as {"TWITTER_AUTH_TOKEN":"..."}.`);
    }

    const env: Record<string, string> = {};
    for (const [name, value] of Object.entries(parsed)) {
        if (!credentialName.test(name) || instanceName.test(name)) {
            throw new InvalidParameterError(`${headerName}: "${name}" cannot be set per request.`);
        }
        if (typeof value !== 'string' || value === '') {
            throw new InvalidParameterError(`${headerName}: "${name}" must be a non-empty string.`);
        }
        env[name] = value;
    }
    return env;
};

const middleware: MiddlewareHandler = async (ctx, next) => {
    const header = ctx.req.header(headerName);
    if (header === undefined) {
        await next();
        return;
    }
    if (!config.allowRequestConfig || !config.accessKey) {
        throw new InvalidParameterError(`${headerName} is not enabled on this instance, set ALLOW_REQUEST_CONFIG=true together with ACCESS_KEY.`);
    }
    await runWithRequestEnv(parseEnv(header), () => next());
};

export default middleware;
