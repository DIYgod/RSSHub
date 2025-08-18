import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { normalizeLazyImages } from './utils';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/:section?',
    categories: ['programming'],
    example: '/secretsanfrancisco/top-news',
    parameters: { section: 'section name, can be found in url' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Section',
    maintainers: ['EthanWng97'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://secretsanfrancisco.com/';
    const section = ctx.req.param('section');
    const url = section ? `${baseUrl}${section}/feed` : `${baseUrl}feed`;

    const feed = await parser.parseURL(url);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('.layout-sidebar, .single__footer-share-container').remove();

                const $content = $('section.article__content');
                normalizeLazyImages($, $content, baseUrl);

                const single = {
                    title: item.title,
                    description: $content.html(),
                    pubDate: item.pubDate,
                    link: item.link,
                    author: item.creator,
                };

                return single;
            })
        )
    );
    return {
        title: section ? `Secret San Francisco - ${section}` : `Secret San Francisco`,
        link: url,
        item: items,
    };
}
