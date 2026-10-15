import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/commonslibrary/type/:topic?',
    categories: ['government'],
    example: '/parliament.uk/commonslibrary/type/research-briefing',
    parameters: { topic: 'Publication type, research-briefing by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Commonlibrary',
    maintainers: ['AntiKnot'],
    handler,
};

async function handler(ctx) {
    const { topic = 'research-briefing' } = ctx.req.param();
    const url = `https://commonslibrary.parliament.uk/type/${topic}/`;
    const response = await ofetch(`${url}feed/`, { responseType: 'text' });
    const feed = await parser.parseString(response);
    if (!feed.title) {
        throw new Error(`The official library feed at ${url}feed/ is missing its title.`);
    }

    return {
        title: feed.title,
        link: url,
        description: feed.description,
        language: 'en',
        item: feed.items.flatMap((item) => {
            if (!item.title || !item.link) {
                return [];
            }
            return {
                title: item.title,
                link: item.link,
                guid: item.guid,
                author: item.creator || undefined,
                description: item['content:encoded'] ?? item.content,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            };
        }),
    } satisfies Data;
}
