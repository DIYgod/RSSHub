import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const cookieJar: Record<string, string> = {};

function buildCookieHeader(): string {
    const cookies: string[] = [];
    for (const name of Object.keys(cookieJar)) {
        const cookie = cookieJar[name];
        cookies.push(`${name}=${cookie}`);
    }
    return cookies.length > 0 ? cookies.join('; ') : '';
}

function parseCookies(setCookieHeaders: string | string[] | undefined) {
    if (!setCookieHeaders) {
        return;
    }
    const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

    for (const cookieString of cookies) {
        const parts = cookieString.split(';');
        const cookiePart = parts[0].trim();
        const [name, value] = cookiePart.split('=');

        if (name && value) {
            cookieJar[name] = value;
        }
    }
}

async function fetchNews(url: string): Promise<any> {
    const cookieHeader = buildCookieHeader();
    const response = await ofetch.raw(url, {
        headers: {
            ...(cookieHeader && { Cookie: cookieHeader }),
        },
        redirect: 'manual',
    });

    if (response.status === 302) {
        const setCookieHeaders = response.headers.getSetCookie();
        if (setCookieHeaders) {
            parseCookies(setCookieHeaders);
        }
        const location = response.headers.get('location');
        if (location) {
            return await fetchNews(location);
        }
    }
    return response;
}

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
            source: ['www3.nhk.or.jp/news/easy/', 'www3.nhk.or.jp/'],
        },
    ],
    name: 'News Web Easy',
    maintainers: ['Andiedie'],
    handler,
    url: 'www3.nhk.or.jp/news/easy/',
};

async function handler(ctx) {
    await fetchNews('https://news.web.nhk/tix/build_authorize?idp=a-alaz&profileType=abroad&redirect_uri=https%3A%2F%2Fnews.web.nhk%2Fnews%2Feasy%2F&entity=none&area=130&pref=13&jisx0402=13101&postal=1000001');
    const response = await fetchNews('https://www3.nhk.or.jp/news/easy/news-list.json');
    const datas = response._data[0];

    let items = Object.values(datas).flatMap((articles: any) =>
        articles.map((article: any) => ({
            title: article.title,
            description: art(path.join(__dirname, 'templates/news_web_easy.art'), {
                title: article.title_with_ruby,
                image: article.news_web_image_uri,
            }),
            guid: article.news_id,
            pubDate: timezone(parseDate(article.news_prearranged_time), +9),
            link: `https://www3.nhk.or.jp/news/easy/${article.news_id}/${article.news_id}.html`,
        }))
    );

    items = items.toSorted((a, b) => b.pubDate - a.pubDate).slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await fetchNews(item.link);
                const $ = load(response._data);
                item.description += $('.article-body').html();
                return item;
            })
        )
    );

    return {
        title: 'NEWS WEB EASY',
        link: 'https://www3.nhk.or.jp/news/easy/',
        description: 'NEWS WEB EASYは、小学生・中学生の皆さんや、日本に住んでいる外国人のみなさんに、わかりやすいことば　でニュースを伝えるウェブサイトです。',
        item: items,
    };
}
