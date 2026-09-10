import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';

import { extractChangelogItems } from '../lib/routes/deepseek/changelog';

describe('DeepSeek changelog route', () => {
    it.each([
        ['Date', 'Release', 'English content'],
        ['时间', '发布', '中文内容'],
    ])('extracts %s changelog entries', (dateLabel, titleSuffix, content) => {
        const $ = load(`
            <div class="theme-doc-markdown"><div><div>
                <h1>Change Log</h1>
                <hr>
                <h2 id="date-2026-09-10">${dateLabel}: 2026-09-10</h2>
                <h3 id="deepseek-v4-release">DeepSeek V4 ${titleSuffix}</h3>
                <p>${content}</p>
                <hr>
                <h2 id="date-2026-08-21">${dateLabel}: 2026-08-21</h2>
                <h3 id="deepseek-v3-release">DeepSeek V3 ${titleSuffix}</h3>
                <p>Older content</p>
            </div></div></div>
        `);

        const items = extractChangelogItems($, 'https://api-docs.deepseek.com/updates/');

        expect(items).toHaveLength(2);
        expect(items[0]).toMatchObject({
            title: `DeepSeek V4 ${titleSuffix}`,
            link: 'https://api-docs.deepseek.com/updates/#deepseek-v4-release',
            description: `<p>${content}</p>`,
        });
        expect(items[0].pubDate?.getFullYear()).toBe(2026);
        expect(items[0].pubDate?.getMonth()).toBe(8);
        expect(items[0].pubDate?.getDate()).toBe(10);
    });
});
