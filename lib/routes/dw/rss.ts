import { Route } from '@/types';
import { config } from '@/config';
import Parser from 'rss-parser';
import { processItems } from './utils';

export const route: Route = {
    path: '/rss/:channel?',
    categories: ['traditional-media'],
    example: '/dw/rss/rss-en-all',
    parameters: {
        category: 'RSS Feed Channel, see below, `rss-en-all` by default',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        requireConfig: false,
    },
    name: 'RSS',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    description: `
For a full list of RSS Feed Channels in English, please refer to [DW RSS Feeds](https://corporate.dw.com/en/rss-feeds/a-68693346).
RSS Feed Channels in other languages are also available, for example: \`rss-chi-all\` renders the RSS feed in Chinese and \`rss-de-all\` for the RSS Feed in German 
`,
};

async function handler(ctx) {
    const category = ctx.req.param('channel') ?? 'rss-en-all';

    const parser = new Parser({
        customFields: {
            item: ['dwsyn:contentID'],
        },
        headers: {
            'User-Agent': config.ua,
        },
    });

    const feed = await parser.parseURL(`https://rss.dw.com/rdf/${category}`);
    const items = await processItems(
        feed.items.map((item) => {
            item.id = item['dwsyn:contentID'];
            item.pubDate = item.isoDate;
            item.description = item.content;
            const link = new URL(item.link);
            link.search = '';
            item.link = link.href;
            item.type = link.pathname.substring(link.pathname.lastIndexOf('/') + 1).startsWith('live-') ? 'liveblog' : 'article'; // dw rss feed only includes liveblogs and articles
            return item;
        })
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
}
