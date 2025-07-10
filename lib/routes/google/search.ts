import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { config } from '@/config';

export const route: Route = {
    path: '/search/:keyword/:language?',
    categories: ['other'],
    example: '/google/search/rss/zh-CN,zh',
    parameters: { keyword: 'Keyword', language: 'Accept-Language. Example: `zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const { keyword, language = 'en' } = ctx.req.param();
    const searchParams = new URLSearchParams({
        q: keyword,
    });
    const tempUrl = new URL('https://www.google.com/search');
    tempUrl.search = searchParams.toString();
    const url = tempUrl.toString();
    const key = `google:search:${language}:${url}`;
    const items = await cache.tryGet(
        key,
        async () => {
            const response = await ofetch(url, {
                headers: {
                    'Accept-Language': language,
                    'User-Agent': 'Lynx/2.9.2 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/3.5.0',
                },
            });
            const $ = load(response);
            return $('body > div > div > div > div > div > div > a')
                .toArray()
                .map((el) => {
                    const element = $(el);
                    const link = element.attr('href')!;
                    const title = element.find('span').first().text().trim();
                    const description = element.parent().next().find('span > span').last().text().trim().replaceAll('�', '') || '';
                    const author = element.find('span > span').text().trim() || '';
                    return {
                        link: new URL(link, 'https://www.google.com').searchParams.get('q') || link,
                        title,
                        description,
                        author,
                    };
                });
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${keyword} - Google Search`,
        description: `${keyword} - Google Search`,
        link: url,
        item: items,
    };
}
