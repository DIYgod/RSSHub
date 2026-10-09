import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import RejectError from '@/errors/types/reject';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';

const stateTtl = 600;
const statePrefix = 'weibo:oauth:state:';

export interface WeiboOAuthState {
    feature: string;
    routeParams?: string;
    accessScope: string;
    expiresAt: number;
}

export const hasValidAccessCredential = (ctx: Context) => {
    const path = new URL(ctx.req.url).pathname;
    return !config.accessKey || ctx.req.query('key') === config.accessKey || ctx.req.query('code') === md5(path + config.accessKey);
};

export const createWeiboOAuthState = async (ctx: Context, feature: string | number, routeParams?: string) => {
    if (!hasValidAccessCredential(ctx)) {
        throw new RejectError('Authentication failed. Access denied.');
    }
    if (!cache.status.available || !cache.globalCache.supportsAtomicClaims) {
        throw new ConfigNotFoundError('Protected Weibo OAuth requires an available memory or Redis cache for one-time authorization states.');
    }
    const nonce = crypto.randomUUID();
    const state: WeiboOAuthState = {
        feature: String(feature),
        routeParams,
        accessScope: md5(`weibo:oauth:${config.accessKey}`),
        expiresAt: Date.now() + stateTtl * 1000,
    };
    await cache.globalCache.set(statePrefix + nonce, state, stateTtl);
    return nonce;
};

export const consumeWeiboOAuthState = async (nonce: string | undefined): Promise<WeiboOAuthState | undefined> => {
    if (!nonce || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(nonce) || !cache.status.available || !cache.globalCache.supportsAtomicClaims) {
        return;
    }
    const stored = await cache.globalCache.get(statePrefix + nonce);
    if (!stored) {
        return;
    }
    let state: WeiboOAuthState;
    try {
        state = JSON.parse(stored);
    } catch {
        return;
    }
    if (
        state.accessScope !== md5(`weibo:oauth:${config.accessKey}`) ||
        typeof state.feature !== 'string' ||
        (state.routeParams !== undefined && typeof state.routeParams !== 'string') ||
        !Number.isFinite(state.expiresAt) ||
        state.expiresAt <= Date.now()
    ) {
        return;
    }
    // The atomic claim prevents concurrent callbacks from reusing the same state.
    if (!(await cache.globalCache.claim(`${statePrefix}used:${nonce}`, stateTtl)) || !cache.status.available) {
        return;
    }
    await cache.globalCache.set(statePrefix + nonce, '', 1);
    return state;
};
