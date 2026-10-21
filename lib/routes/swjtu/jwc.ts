import { load } from 'cheerio';
import { decodeHTML } from 'entities';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://jwc.swjtu.edu.cn';
const pageURL = `${rootURL}/vatuu/WebAction?setAction=newsList`;

const getItem = async (item) => {
    const newsInfo = item.find('h3').find('a');
    const newsTime = item.find('p').find('span').text().slice(0, 19);
    const newsTitle = newsInfo.text();
    const link = `${rootURL}${newsInfo.attr('href').slice(2)}`;
    const details = await cache.tryGet(`swjtu:jwc:article:${link}`, async () => {
        try {
            const resp = await ofetch.raw<string, 'text'>(link, { responseType: 'text' });
            if (resp.headers.get('content-type')?.split(';', 1)[0].trim() === 'application/pdf') {
                return {
                    enclosure_url: resp.url,
                    enclosure_type: 'application/pdf',
                };
            }
            const $$ = load(resp._data!);
            const responseUrl = new URL(resp.url || link);
            if (responseUrl.hostname === 'sce.swjtu.edu.cn' && responseUrl.pathname === '/news-details.html' && $$('#content.news-detail-content').length) {
                const id = responseUrl.searchParams.get('id');
                if (id) {
                    const article = await ofetch<{ title: string; content: string }>(`https://photo.swjtu.edu.cn/notice/show/${encodeURIComponent(id)}`);
                    const content = load(article.content);
                    content('span')
                        .filter((_, element) => content(element).text() === decodeHTML(article.title))
                        .remove();
                    content('a[href], img[src]').each((_, element) => {
                        const entry = content(element);
                        const attribute = element.tagName === 'a' ? 'href' : 'src';
                        entry.attr(attribute, new URL(entry.attr(attribute)!, responseUrl).href);
                    });
                    const pdf = content('a[href]')
                        .toArray()
                        .find((element) => new URL(content(element).attr('href')!).pathname.toLowerCase().endsWith('.pdf'));
                    return {
                        description: content.html(),
                        enclosure_url: pdf ? content(pdf).attr('href') : undefined,
                        enclosure_type: pdf ? 'application/pdf' : undefined,
                    };
                }
            }
            let newsText = $$('.content-main').html();
            if (!newsText && responseUrl.pathname === '/vatuu/TestInfoAction' && responseUrl.searchParams.get('setAction') === 'noArrangeCourse' && $$('.center table.c-tb').length) {
                newsText = $$('.header .h-btm').toString() + $$('.center table.c-tb').toString();
            }
            if (!newsText && $$('.v_news_content').length) {
                const content = $$('.v_news_content');
                content.find('a[href], img[src]').each((_, element) => {
                    const entry = $$(element);
                    const attribute = element.tagName === 'a' ? 'href' : 'src';
                    entry.attr(attribute, new URL(entry.attr(attribute)!, resp.url || link).href);
                });
                newsText = content.html();
            }
            return {
                description: newsText || undefined,
            };
        } catch (error) {
            if (error instanceof FetchError && error.statusCode === 404) {
                return {
                    description: '',
                };
            }
            throw error;
        }
    });
    return { title: newsTitle, pubDate: newsTime ? timezone(parseDate(newsTime, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined, link, ...details };
};

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/swjtu/jwc',
    parameters: {},
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
            source: ['jwc.swjtu.edu.cn/vatuu/WebAction', 'jwc.swjtu.edu.cn/'],
        },
    ],
    name: '教务网',
    maintainers: ['mobyw'],
    handler,
    url: 'jwc.swjtu.edu.cn/vatuu/WebAction',
};

async function handler() {
    const resp = await got({
        method: 'get',
        url: pageURL,
    });

    const $ = load(resp.data);
    const list = $("[class='littleResultDiv']");

    const items = await pMap(
        list.toArray(),
        (i) => {
            const item = $(i);
            return getItem(item);
        },
        { concurrency: 3 }
    );

    return {
        title: '西南交大-教务网通知',
        link: pageURL,
        item: items,
    };
}
