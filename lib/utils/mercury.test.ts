import { afterEach, describe, expect, it, vi } from 'vitest';

import { parse } from '@/utils/mercury';

const link = 'http://rsshub.test/article';
const article = `<html><body><article>${'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'.repeat(10)}</article></body></html>`;

afterEach(() => {
    vi.restoreAllMocks();
});

describe('mercury', () => {
    it('parses pages', async () => {
        const results = await Promise.all([parse(link, article), parse(link, article.replaceAll('Lorem', 'Morel'))]);
        expect(results[0].content).toContain('Lorem ipsum');
        expect(results[1].content).toContain('Morel ipsum');
    });

    it('returns nothing when the parser fails', async () => {
        expect(await parse(link, '')).toBeUndefined();
    });

    it('gives up on pages that take too long without blocking the event loop', async () => {
        const timeout = AbortSignal.timeout.bind(AbortSignal);
        vi.spyOn(AbortSignal, 'timeout').mockImplementationOnce(() => timeout(1000));

        let ticks = 0;
        const interval = setInterval(() => ticks++, 50);
        await expect(parse(link, '<p>'.repeat(50000))).rejects.toThrow();
        clearInterval(interval);
        expect(ticks).toBeGreaterThan(5);

        // the child is replaced and the next page goes through
        expect((await parse(link, article)).content).toContain('Lorem ipsum');
    });

    it('gives up on pages that take too much memory', async () => {
        await expect(parse(link, '<p>'.repeat(1_500_000))).rejects.toThrow();
    }, 30000);
});
