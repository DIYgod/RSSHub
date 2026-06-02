import { config } from '@/config';

/** Standardised cache key for all SPEC routes. */
export function buildCacheKey(platform: string, ...parts: string[]): string {
    return ['spec', platform, ...parts].join(':');
}

/** Throw a typed error for missing/expired auth. Always call before any fetch. */
export function throwAuthError(code: string, message: string): never {
    const err = new Error(message) as Error & { code: string };
    err.code = code;
    throw err;
}

/** Assert an env var is present; throw a typed auth error if absent. */
export function assertEnv(varName: string, errorCode: string): string {
    const value = (config[varName as keyof typeof config] as string | undefined) ?? process.env[varName];
    if (!value) {
        throwAuthError(errorCode, `${varName} is not set. ${errorCode}`);
    }
    return value;
}
