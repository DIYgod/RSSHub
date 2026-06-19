import { readFileSync } from 'node:fs';
import path from 'node:path';

import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';

import { parseDesktopSeriesListHtml, parseEpisodesFromRawHtml, parseMobileSectionToonInfo, parseMobileSeriesListHtml } from '@/routes/spec/naver-webtoon-list';

const fixturePath = path.join(import.meta.dirname, '../../fixtures/naver-webtoon-848000-list.html');

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

        expect(parsed.seriesFrontImage).toBe('https://image-comic.pstatic.net/webtoon/848000/thumbnail/titledescimage/frontImage_b3287ee3-ee5a-4528-8454-add75e613fc9.png');
        expect(parsed.seriesScore).toBe('9.82');
    });

    it('returns no episodes for desktop SPA shell', () => {
        const spaShell = `<!DOCTYPE html><html><head><meta property="og:title" content="범죄도시0"><meta property="og:image" content="https://shared-comic.pstatic.net/thumb/webtoon/848000/thumbnail/thumbnail_IMAG21_x.jpg"></head><body><div id="root"></div></body></html>`;
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
