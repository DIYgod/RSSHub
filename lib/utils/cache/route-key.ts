import { createHash } from 'node:crypto';

import type { Context } from 'hono';

import { config } from '@/config';
import { hasItemFilters, itemFilters } from '@/utils/route-limit';

// Query parameters that have their own part in the key, or that the parameter middleware applies to the
// cached data after the route ran. Every other parameter may be read by the route itself.
const postProcessParams = new Set([
    'format',
    'limit',
    'sorted',
    'fulltext',
    ...itemFilters,
    'filter_case_sensitive',
    'opencc',
    'brief',
    'scihub',
    'tgiv',
    'chatgpt',
    'enclosure',
    'show_image',
    'image_hotlink_template',
    'multimedia_hotlink_template',
]);

type RouteCacheKeyParts = {
    path: string;
    format: string;
    limit?: string;
    sorted?: string;
    filtered: boolean;
    fulltext?: boolean;
    origin: string;
    prefix: string;
    query: string;
};

/**
 * The route cache key. Every part a client controls is kept apart in a JSON array and the result is hashed
 * with a collision resistant digest, so no request can name the entry of another one.
 */
export const routeCacheKey = (parts: RouteCacheKeyParts) =>
    createHash('sha256')
        .update(JSON.stringify([parts.path, parts.format, parts.limit ?? '', parts.sorted ?? '', parts.filtered, parts.fulltext ?? false, parts.origin, parts.prefix, parts.query]))
        .digest('hex');

export const getRouteCacheKey = (ctx: Context) => {
    const requestUrl = new URL(ctx.req.url);
    const routeQuery = new URLSearchParams([...requestUrl.searchParams].filter(([name]) => !postProcessParams.has(name)));
    routeQuery.sort();
    // Routes may select entries before fetching details according to this option.
    const sortedQuery = ctx.req.query('sorted');

    return routeCacheKey({
        path: ctx.req.path,
        format: ctx.req.query('format') || config.format,
        limit: ctx.req.query('limit'),
        sorted: sortedQuery === undefined ? undefined : sortedQuery === 'false' ? 'false' : 'true',
        filtered: hasItemFilters(ctx),
        fulltext: ctx.req.query('fulltext') === 'true',
        // routes may build links from the request origin and the forwarded prefix
        origin: requestUrl.origin,
        prefix: ctx.req.header('x-forwarded-prefix') ?? '',
        query: routeQuery.toString(),
    });
};
