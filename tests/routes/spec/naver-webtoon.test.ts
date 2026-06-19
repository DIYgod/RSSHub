import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';

import {
    parseDesktopSeriesListHtml,
    parseEpisodesFromRawHtml,
    parseMobileSectionToonInfo,
    parseMobileSeriesListHtml,
} from '@/routes/spec/naver-webtoon-list';
import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixturePath = path.join(
    import.meta.dirname,
    '../../fixtures/naver-webtoon-848000-list.html',
);
const webtoonFixture = JSON.parse(
    readFileSync(
        path.join(
            import.meta.dirname,
            '../../fixtures/spec-naver-webtoon.json',
        ),
        'utf-8',
    ),
) as { _extras: unknown[] };

const TITLE_ID = '848000';

async function callHandler(titleId: string) {
    const { route } = await import('@/routes/spec/naver-webtoon');
    const ctx = {
        req: { param: (k: string) => ({ titleId })[k] },
    } as any;
    return route.handler(ctx);
}

describe('naver-webtoon-list parsers', () => {
    it('parses mobile SSR list with episode thumbnails', () => {
        const html = readFileSync(fixturePath, 'utf-8');
        const parsed = parseMobileSeriesListHtml(html, '848000');

        expect(parsed.episodes.length).toBeGreaterThan(10);
        expect(parsed.seriesTitle).toContain('범죄도시');
        expect(parsed.seriesThumb).toMatch(/848000/);
        expect(parsed.seriesFrontImage).toMatch(/frontImage_/);
        expect(parsed.seriesScore).toBe('9.82');
        expect(parsed.seriesAuthor).toContain('박태준');
        expect(parsed.seriesRating).toContain('15세');
        expect(parsed.seriesDayOfWeek).toContain('일');

        const ep17 = parsed.episodes.find((e) => e.no === '17');
        expect(ep17?.title).toBe('17화. 간통남 마석도');
        expect(ep17?.thumbnail).toMatch(/848000\/17\/thumbnail_202x120_/);
    });

    it('extracts frontImage from section_toon_info via parseMobileSectionToonInfo', () => {
        const html = readFileSync(fixturePath, 'utf-8');
        const parsed = parseMobileSectionToonInfo(load(html));

        expect(parsed.seriesFrontImage).toBe(
            'https://image-comic.pstatic.net/webtoon/848000/thumbnail/titledescimage/frontImage_b3287ee3-ee5a-4528-8454-add75e613fc9.png',
        );
        expect(parsed.seriesScore).toBe('9.82');
    });

    it('returns no episodes for desktop SPA shell', () => {
        const spaShell =
            '<!DOCTYPE html><html><head><meta property="og:title" content="범죄도시0"><meta property="og:image" content="https://shared-comic.pstatic.net/thumb/webtoon/848000/thumbnail/thumbnail_IMAG21_x.jpg"></head><body><div id="root"></div></body></html>';
        const parsed = parseDesktopSeriesListHtml(spaShell, '848000');
        expect(parsed.episodes).toEqual([]);
        expect(parsed.seriesTitle).toBe('범죄도시0');
    });

    it('regex fallback recovers episodes from raw HTML', () => {
        const html = readFileSync(fixturePath, 'utf-8');
        const parsed = parseEpisodesFromRawHtml(html, '848000');
        expect(parsed.episodes.length).toBeGreaterThan(10);
        expect(parsed.episodes[0]?.thumbnail).toMatch(/thumbnail_202x120_/);
    });
});

describe('spec/naver-webtoon route handler', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(TITLE_ID);
        expect(data.item!.length).toBe(webtoonFixture._extras.length);
        expect(data.item!.map((i) => i._extra)).toEqual(webtoonFixture._extras);
    });

    it('happy path — returns episodes with _extra', async () => {
        const data = await callHandler(TITLE_ID);
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item!.find((i) => i._extra?.externalId === '17');
        expect(item?._extra?.platform).toBe('naver-webtoon');
        expect(item?._extra?.type).toBe('naver/webtoon/episode');
        expect(item?._extra?.titleId).toBe(TITLE_ID);
        expect(item?._extra?.episodeNumber).toBe(17);
        expect(item?._extra?.panelImageUrls?.length).toBeGreaterThan(0);
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(TITLE_ID);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('naver-webtoon');
    });

    it('_extra payload validates against the Zod contract', async () => {
        const data = await callHandler(TITLE_ID);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it('empty episode list — throws InvalidParameterError', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(
            http.get('https://m.comic.naver.com/webtoon/list', () =>
                HttpResponse.text('<html><body></body></html>'),
            ),
            http.get('https://comic.naver.com/webtoon/list', () =>
                HttpResponse.text('<html><body></body></html>'),
            ),
        );
        await expect(callHandler(TITLE_ID)).rejects.toThrow(
            /No episodes found/,
        );
    });
});
