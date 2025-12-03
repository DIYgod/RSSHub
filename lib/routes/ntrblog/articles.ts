import { load } from 'cheerio';
import Parser from 'rss-parser';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

type CustomItem = { issued: string };
const parser = new Parser<any, CustomItem>({
    customFields: {
        item: ['issued'],
    },
});

export const route: Route = {
    path: '/articles',
    categories: ['anime'],
    example: '/ntrblog/articles',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Articles',
    maintainers: ['keocheung'],
    radar: [
        {
            source: ['ntrblog.com'],
        },
    ],
    handler,
};

async function handler(): Promise<Data> {
    const rsp = await got('https://ntrblog.com/atom.xml');
    const feed = await parser.parseString(rsp.data);

    const items = await Promise.all(
        feed.items.map((item) => {
            if (!item.link) {
                return item;
            }
            return cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                const content = $('div.article-body');
                content.find('#twitter-widget-1').remove();
                content.find('[id^="ldblog_related_articles_"]').remove();
                content.find('#ad2').remove();
                item.content = `<div lang="ja">${content.html()}</div>`;
                return item;
            });
        })
    );

    return {
        title: feed.title || 'NTR BLOG（寝取られブログ）',
        link: feed.link || 'https://ntrblog.com',
        description: feed.description || 'NTR BLOG（寝取られブログ）最新文章',
        image: feed.image?.url,
        item: items.map(
            (item): DataItem => ({
                title: item.title || '',
                link: item.link || '',
                author: item.author || '',
                pubDate: item.issued ? new Date(item.issued) : undefined,
                description: item.content || '',
                image: item.enclosure?.url,
                guid: item.guid,
            })
        ),
        language: 'ja',
    };
}
