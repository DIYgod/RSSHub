import { Route } from '@/types';

import cache from '@/utils/cache';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { URL } from 'node:url';
import * as https from 'node:https';
import * as http from 'node:http';

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

function makeHttpRequest(url: string): Promise<{ statusCode: number; data: string; }> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const httpModule = isHttps ? https : http;

        const cookieHeader = buildCookieHeader();

        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ...(cookieHeader && { 'Cookie': cookieHeader }),
            }
        };

        const req = httpModule.request(requestOptions, (res) => {
            const setCookieHeaders = res.headers['set-cookie'];
            if (setCookieHeaders) {
                parseCookies(setCookieHeaders);
            }

            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
                const location = res.headers.location;
                if (location) {
                    makeHttpRequest(location)
                        .then(resolve)
                        .catch(reject);
                    return;
                }
            }

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode || 200,
                    data,
                });
            });

            res.on('error', (error) => {
                reject(error);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
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
    await makeHttpRequest('https://news.web.nhk/tix/build_authorize?idp=a-alaz&profileType=abroad&redirect_uri=https%3A%2F%2Fnews.web.nhk%2Fnews%2Feasy%2F&entity=none&area=130&pref=13&jisx0402=13101&postal=1000001');
    const response = await makeHttpRequest('https://www3.nhk.or.jp/news/easy/news-list.json');
    const dates = JSON.parse(response.data)[0];

    let items = Object.values(dates).flatMap((articles: any) =>
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
                const response = await makeHttpRequest(item.link);
                const $ = load(response.data);
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
