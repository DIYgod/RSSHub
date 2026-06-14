import { beforeEach, describe, expect, it, vi } from 'vitest';

import ofetch from '@/utils/ofetch';

import { route } from './routes/bloomberg/index';
import { parseLineupNewsList } from './routes/bloomberg/utils';

vi.mock('@/utils/ofetch', () => ({
    default: vi.fn(),
}));

const createContext = (limit?: string) => ({
    req: {
        query: (key: string) => (key === 'limit' ? limit : undefined),
    },
});

describe('bloomberg route', () => {
    beforeEach(() => {
        vi.mocked(ofetch).mockReset();
    });

    it('documents the AI sectionfront channel', () => {
        const site = route.parameters?.site;

        expect(route.example).toBe('/bloomberg/bbiz');
        expect(route.name).toBe('Site');
        expect(route.description).toContain('| ai           | AI');
        expect(typeof site).toBe('object');
        expect(site).toMatchObject({
            description: 'Site ID, can be found below',
        });
        expect(site && typeof site === 'object' && 'options' in site ? site.options : []).toContainEqual({
            value: 'ai',
            label: 'AI',
        });
    });

    it('parses lineup stories for the AI sectionfront', async () => {
        vi.mocked(ofetch).mockResolvedValue({
            html: `
                <article class="story-list-story" data-id="FIRST" data-updated-at="2026-06-14T08:00:00.000Z">
                    <a class="story-list-story__info__headline-link" href="/news/articles/2026-06-14/first-ai-story">First AI Story</a>
                </article>
                <article class="story-list-story" data-id="DUPLICATE">
                    <a class="story-list-story__info__headline-link" href="/news/articles/2026-06-14/first-ai-story">Duplicate AI Story</a>
                </article>
                <article>
                    <time datetime="2026-06-13T08:00:00.000Z"></time>
                    <a href="https://www.bloomberg.com/news/articles/2026-06-13/second-ai-story">Second AI Story</a>
                </article>
            `,
        });

        const list = await parseLineupNewsList('ai', createContext('2'));

        expect(ofetch).toHaveBeenCalledWith('https://www.bloomberg.com/lineup/api/lazy_load_stories?slug=ai&page=1', {
            headers: {
                accept: 'application/json',
                referer: 'https://www.bloomberg.com/ai',
            },
        });
        expect(list).toEqual([
            {
                title: 'First AI Story',
                link: 'https://www.bloomberg.com/news/articles/2026-06-14/first-ai-story',
                pubDate: new Date('2026-06-14T08:00:00.000Z'),
                guid: 'bloomberg:FIRST',
            },
            {
                title: 'Second AI Story',
                link: 'https://www.bloomberg.com/news/articles/2026-06-13/second-ai-story',
                pubDate: new Date('2026-06-13T08:00:00.000Z'),
            },
        ]);
    });

    it('throws a clear error when the lineup API returns no HTML', async () => {
        vi.mocked(ofetch).mockResolvedValue({});

        await expect(parseLineupNewsList('ai', createContext())).rejects.toThrow('Unable to fetch Bloomberg ai channel stories. The lineup API returned no HTML.');
    });
});
