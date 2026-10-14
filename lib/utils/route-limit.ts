import type { Context } from 'hono';

const itemFilters = ['filter', 'filter_title', 'filter_description', 'filter_author', 'filter_category', 'filterout', 'filterout_title', 'filterout_description', 'filterout_author', 'filterout_category', 'filter_time'];

export const hasItemFilters = (ctx: Context) => itemFilters.some((key) => ctx.req.query(key));

export function getRouteLimit(ctx: Context, defaultLimit: number): number;
export function getRouteLimit(ctx: Context): number | undefined;
export function getRouteLimit(ctx: Context, defaultLimit?: number): number | undefined {
    const requestedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
    const limit = requestedLimit > 0 ? requestedLimit : undefined;
    if (hasItemFilters(ctx)) {
        // Retain the default candidate pool before common filters run, including
        // a larger explicit source page size when the route supports one.
        return defaultLimit === undefined ? undefined : Math.max(defaultLimit, limit ?? defaultLimit);
    }
    return limit ?? defaultLimit;
}
