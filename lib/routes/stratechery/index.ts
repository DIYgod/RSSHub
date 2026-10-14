import { load } from 'cheerio';
import RSSParser from 'rss-parser';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/stratechery',
    name: 'Blog',
    maintainers: ['chazeon'],
    handler,
};

async function handler() {
    const link = 'https://stratechery.com/';
    const response = await ofetch(`${link}feed/`, { responseType: 'text' });
    const feed = await new RSSParser().parseString(response);
    const items = feed.items.flatMap((item) => {
        if (!item.title || !item.link) {
            return [];
        }
        const content = load(item['content:encoded'] || item.content || item.description || '');
        content('.passport-podcast-player-logged-out-view-overlay').remove();
        return {
            title: item.title,
            link: item.link,
            guid: item.guid || item.link,
            description: content.html(),
            author: item.creator,
            category: item.categories,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
        };
    });
    return {
        title: 'Stratechery by Ben Thompson',
        link,
        author: 'Ben Thompson',
        description: 'Stratechery provides analysis of the strategy and business side of technology and media, and the impact of technology on society. ',
        item: items,
    };
}
