import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { domainValidation } from './utils';

export const route: Route = {
    path: '/author/:uid/:lang?',
    categories: ['multimedia'],
    example: '/91porn/author/2d6d2iWm4vVCwqujAZbSrKt2QJCbbaObv9HQ21Zo8wGJWudWBg',
    parameters: { uid: 'Author ID, can be found in URL', lang: 'Language, see above, `en_US` by default ' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['91porn.com/index.php'],
            target: '',
        },
    ],
    name: 'Author',
    maintainers: ['TonyRL'],
    handler,
    url: '91porn.com/index.php',
};

async function handler(ctx) {
    const { domain = '91porn.com' } = ctx.req.query();
    const { uid, lang = 'en_US' } = ctx.req.param();
    const siteUrl = `https://${domain}/uvideos.php?UID=${uid}&type=public`;
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
