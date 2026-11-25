import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

const rootUrl = 'https://www.iplaysoft.com/';

async function fetchArchive(slug: string, type: 'categories' | 'tags') {
    const feedUrl = `${rootUrl}${type === 'categories' ? 'category' : 'tag'}/${encodeURIComponent(slug)}/feed/`;
    const feed = await parser.parseString(await ofetch<string, 'text'>(feedUrl, { responseType: 'text' }));

    // WordPress's posts API returns ten entries by default.
    const items = await pMap(
        feed.items.slice(0, 10),
        async (item): Promise<DataItem> => {
            if (!item.title || !item.link) {
                throw new Error('The archive feed contains an article without a title or link');
            }
            const description = await cache.tryGet(item.link, async () => {
                const articleContent = await ofetch(item.link!);
                const $ = load(articleContent);
                const content = $('.entry-content');
                if (!content.length) {
                    throw new Error(`Article content is unavailable: ${item.link}`);
                }
                content.find('div[style*="overflow:hidden"]').remove();
                return content.html();
            });
            return {
                title: item.title,
                link: item.link,
                description,
                author: item.creator,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                category: item.categories,
            };
        },
        { concurrency: 3 }
    );
    return { name: feed.title?.replace(/\s*[–-]\s*异次元软件世界$/, ''), items };
}

export { fetchArchive };
