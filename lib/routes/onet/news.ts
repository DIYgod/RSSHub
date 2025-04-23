import { Route } from '@/types';

import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseArticleContent, parseMainImage } from './utils';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/onet/news',
    parameters: {},
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
            source: ['wiadomosci.onet.pl/'],
        },
    ],
    name: 'News',
    maintainers: ['Vegann'],
    handler,
    url: 'wiadomosci.onet.pl/',
    description: `This route provides a better reading experience (full text articles) over the official one for \`https://wiadomosci.onet.pl\`.`,
};

async function handler() {
    const rssUrl = 'https://wiadomosci.onet.pl/.feed';
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.map(async (item) => {
            const { description, author, category } = await cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    headers: {
                        referer: 'https://www.onet.pl/', // for some reason onet.pl will redirect to the main page if referer is not set
                    },
                });

                const $ = load(response);
                const content = parseArticleContent($);

                const mainImage = parseMainImage($);

                const description = art(path.join(__dirname, 'templates/article.art'), {
                    mainImage,
                    lead: $('#lead').text()?.trim(),
                    content: content.html()?.trim(),
                });

                const author = $('.authorNameWrapper span[itemprop="name"]').text()?.trim();
                const category = $('span.relatedTopic').text()?.trim();

                return { description, author, category };
            });
            return {
                title: item.title,
                link: item.link,
                description,
                author,
                category,
                pubDate: parseDate(item.pubDate),
                guid: item.id,
            };
        })
    );
    return {
        title: feed.title,
        link: feed.link,
        description: feed.title,
        item: items,
        language: 'pl',
        image: 'https://ocdn.eu/wiadomosciucs/static/logo2017/onet2017big_dark.png',
    };
}
