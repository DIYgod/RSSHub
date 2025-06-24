import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { domainValidation } from './utils';

export const route: Route = {
    path: '/:lang?',
    categories: ['multimedia'],
    example: '/91porn',
    parameters: { lang: 'Language, see below, `en_US` by default ' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['91porn.com/index.php'],
            target: '',
        },
    ],
    name: 'Hot Video Today',
    maintainers: ['TonyRL'],
    handler,
    url: '91porn.com/index.php',
    description: `| English | 简体中文 | 繁體中文 |
| ------- | -------- | -------- |
| en\_US  | cn\_CN   | zh\_ZH   |`,
};

async function handler(ctx) {
    const { domain = '91porn.com' } = ctx.req.query();
    const siteUrl = `https://${domain}/index.php`;
    const { lang = 'en_US' } = ctx.req.param();
    domainValidation(domain);

    const response = await got.post(siteUrl, {
        form: {
            session_language: lang,
        },
        headers: {
            referer: siteUrl,
        },
    });

    const $ = load(response.data);

    let items = $('.row .well')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.video-title').text(),
                link: item.find('a').attr('href'),
                poster: item.find('.img-responsive').attr('src'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(`91porn:${lang}:${new URL(item.link).searchParams.get('viewkey')}`, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                item.pubDate = parseDate($('.title-yakov').eq(0).text(), 'YYYY-MM-DD');
                item.description = art(path.join(__dirname, 'templates/index.art'), {
                    link: item.link,
                    poster: item.poster,
                });
                item.author = $('.title-yakov a span').text();
                delete item.poster;

                return item;
            })
        )
    );

    return {
        title: `${$('.login_register_header').text()} - 91porn`,
        link: siteUrl,
        item: items,
    };
}
