import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/topics/:topic?',
    categories: ['traditional-media'],
    example: '/cbc/topics',
    parameters: { topic: 'Channel,`Top Stories` by default. For secondary channel like `canada/toronto`, use `-` to replace `/`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cbc.ca/news'],
            target: '/topics',
        },
    ],
    name: 'News',
    maintainers: ['wb14123'],
    handler,
    url: 'cbc.ca/news',
};

async function handler(ctx) {
    const baseUrl = 'https://www.cbc.ca';
    const topic = ctx.req.param('topic') || '';
    const url = `${baseUrl}/news${topic ? `/${topic.replace('-', '/')}` : ''}`;

    const response = await got(url);

    const data = response.data;

    const $ = load(data);
    const links = [];

    function pushLinks(index, item) {
        const link = item.attribs.href;
        if (link.startsWith('/')) {
            links.push(baseUrl + link);
        }
    }

    $('a.contentWrapper').each(pushLinks);
    $('a.card').each(pushLinks);

    const out = await Promise.all(
        links.map((link) =>
            cache.tryGet(link, async () => {
                const result = await got(link);

                const $ = load(result.data);

                const head = JSON.parse($('script[type="application/ld+json"]').first().text());
                if (!head) {
                    return [];
                }

                const title = head.headline;
                let author = '';
                if (head.author) {
                    author = head.author.map((author) => author.name).join(' & ');
                }
                const pubDate = head.datePublished;
                const descriptionDom = $('div[data-cy=storyWrapper]');
                descriptionDom.find('div[class=share]').remove();
                descriptionDom.find('div[class^="textToSpeech"]').remove();
                const description = descriptionDom.html();

                return { title, author, pubDate, description, link };
            })
        )
    );

    return {
        title: $('title').text(),
        link: url,
        item: out.filter((x) => x.title),
    };
}
