import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
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

type EasyArticle = {
    title: string;
    news_web_image_uri: string;
    news_id: string;
    news_prearranged_time: string;
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
        .map((c) => c.split(';', 1)[0])
        .join('; ');

    const authorizeResponse = await ofetch.raw(buildAuthorizeResponse.headers.get('location')!, {
        redirect: 'manual',
    });

    const idpResponse = await ofetch.raw(authorizeResponse.headers.get('location')!, {
        headers: {
            cookie: buildAuthorizeCookie,
        },
        redirect: 'manual',
    });
    const idpCookie = idpResponse.headers
        .getSetCookie()
        .map((c) => c.split(';', 1)[0])
        .join('; ');

    const data = await ofetch<Array<Record<string, EasyArticle[]>>>('https://news.web.nhk/news/easy/news-list.json', {
        headers: {
            cookie: buildAuthorizeCookie + '; ' + idpCookie,
        },
    });
    const dates = data[0];

    let items = Object.values(dates).flatMap((articles) =>
        articles.map((article) => ({
            title: article.title,
            description: renderToString(
                <>
                    {article.news_web_image_uri ? <img src={article.news_web_image_uri} /> : null}
                    <br />
                </>
            ),
            guid: article.news_id,
            pubDate: timezone(parseDate(article.news_prearranged_time), 9),
            link: `https://news.web.nhk/news/easy/${article.news_id}/${article.news_id}.html`,
        }))
    );

    items = items.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime()).slice(0, getRouteLimit(ctx, 30));

    items = await pMap(
        items,
        async (item) => ({
            ...item,
            description:
                item.description +
                (await cache.tryGet(`nhk:easy:body:v2:${item.link}`, async () => {
                    const data = await ofetch(item.link, {
                        headers: {
                            cookie: buildAuthorizeCookie + '; ' + idpCookie,
                        },
                    });
                    const $ = load(data);
                    return $('.article-body').html() ?? '';
                })),
        }),
        { concurrency: 3 }
    );

    return {
        title: 'NEWS WEB EASY',
        link: 'https://news.web.nhk/news/easy/',
        description: 'NEWS WEB EASYは、小学生・中学生の皆さんや、日本に住んでいる外国人のみなさんに、わかりやすいことば\u{3000}でニュースを伝えるウェブサイトです。',
        item: items,
    };
}
