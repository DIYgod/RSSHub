import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news_web_easy',
    categories: ['traditional-media'],
    example: '/nhk/news_web_easy',
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
            source: ['news.web.nhk/news/easy/', 'news.web.nhk/'],
        },
    ],
    name: 'News Web Easy',
    maintainers: ['Andiedie'],
    handler,
    url: 'news.web.nhk/news/easy/',
};

async function handler(ctx) {
    const buildAuthorizeResponse = await ofetch.raw('https://news.web.nhk/tix/build_authorize', {
        query: {
            idp: 'a-alaz',
            profileType: 'abroad',
            redirect_uri: 'https://news.web.nhk/news/easy/',
            entity: 'none',
            area: '130',
            pref: '13',
            jisx0402: '13101',
            postal: '1000001',
        },
        redirect: 'manual',
    });
    const buildAuthorizeCookie = buildAuthorizeResponse.headers
        .getSetCookie()
        .map((c) => c.split(';')[0])
        .join('; ');

    const authorizeResponse = await ofetch.raw(buildAuthorizeResponse.headers.get('location'), {
        redirect: 'manual',
    });

    const idpResponse = await ofetch.raw(authorizeResponse.headers.get('location'), {
        headers: {
            cookie: buildAuthorizeCookie,
        },
        redirect: 'manual',
    });
    const idpCookie = idpResponse.headers
        .getSetCookie()
        .map((c) => c.split(';')[0])
        .join('; ');

    const data = await ofetch('https://news.web.nhk/news/easy/news-list.json', {
        headers: {
            cookie: buildAuthorizeCookie + '; ' + idpCookie,
        },
    });
    const dates = data[0];

    let items = Object.values(dates).flatMap((articles) =>
        articles.map((article) => ({
            title: article.title,
            description: art(path.join(__dirname, 'templates/news_web_easy.art'), {
                title: article.title_with_ruby,
                image: article.news_web_image_uri,
            }),
            guid: article.news_id,
            pubDate: timezone(parseDate(article.news_prearranged_time), +9),
            link: `https://news.web.nhk/news/easy/${article.news_id}/${article.news_id}.html`,
        }))
    );

    items = items.toSorted((a, b) => b.pubDate - a.pubDate).slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const data = await ofetch(item.link, {
                    headers: {
                        cookie: buildAuthorizeCookie + '; ' + idpCookie,
                    },
                });
                const $ = load(data);
                item.description += $('.article-body').html();
                return item;
            })
        )
    );

    return {
        title: 'NEWS WEB EASY',
        link: 'https://news.web.nhk/news/easy/',
        description: 'NEWS WEB EASYは、小学生・中学生の皆さんや、日本に住んでいる外国人のみなさんに、わかりやすいことば　でニュースを伝えるウェブサイトです。',
        item: items,
    };
}
