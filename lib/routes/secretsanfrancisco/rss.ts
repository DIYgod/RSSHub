import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { normalizeLazyImages } from './utils';

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
    const section = ctx.req.param('section') || 'top-news';
    const url = `${baseUrl}/${section}/`;
    const { data: response } = await got(url);
    const $ = load(response);
    const list = $('article.post')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const a = $el.find('h2.archive__post-title a');
            const href = a.attr('href') || '';

            return {
                title: a.text().trim(),
                link: href.startsWith('http') ? href : new URL(href, baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('.layout-sidebar, .single__footer-share-container').remove();
                const datetime = $('.single__author time').attr('datetime');

                const $content = $('section.article__content');
                normalizeLazyImages($, $content, baseUrl);

                item.description = $content.html();
                item.author = $('.single__author a.notranslate').text();
                item.pubDate = parseDate(datetime);

                return item;
            })
        )
    );
    return {
        title: `Secret San Francisco - ${section}`,
        link: url,
        item: items,
    };
}
