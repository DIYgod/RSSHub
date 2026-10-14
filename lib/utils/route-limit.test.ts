import { Context } from 'hono';
import { describe, expect, it } from 'vitest';

import { getRouteLimit, hasItemFilters } from './route-limit';

const context = (query: string) => new Context(new Request(`https://rsshub.example/feed?${query}`));

describe('route candidate limits', () => {
    it('retains the existing default and explicit unfiltered limits', () => {
        expect(getRouteLimit(context(''), 20)).toBe(20);
        expect(getRouteLimit(context('limit=3'), 20)).toBe(3);
        expect(getRouteLimit(context('limit=50'), 20)).toBe(50);
        expect(getRouteLimit(context(''))).toBeUndefined();
    });

    it.each(['filter', 'filter_title', 'filter_description', 'filter_author', 'filter_category', 'filterout', 'filterout_title', 'filterout_description', 'filterout_author', 'filterout_category', 'filter_time'])(
        'retains the default candidate pool for active %s',
        (key) => {
            expect(getRouteLimit(context(`limit=3&${key}=value`), 20)).toBe(20);
            expect(getRouteLimit(context(`limit=50&${key}=value`), 20)).toBe(50);
            expect(getRouteLimit(context(`limit=3&${key}=value`))).toBeUndefined();
        }
    );

    it.each(['filter_case_sensitive=false', 'filter_title=', 'filterout=', 'filter_time='])('preserves small explicit limits without an active item filter: %s', (query) => {
        const ctx = context(`limit=3&${query}`);
        expect(hasItemFilters(ctx)).toBe(false);
        expect(getRouteLimit(ctx, 20)).toBe(3);
    });
});
