import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

class ArticleAccessError extends Error {}

export const route: Route = {
    path: '/gs/tzgg',
    categories: ['university'],
    example: '/xjtu/gs/tzgg',
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
            source: ['gs.xjtu.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['nczitzk'],
    handler,
    url: 'gs.xjtu.edu.cn/',
};

async function handler() {
    const rootUrl = 'http://gs.xjtu.edu.cn/tzgg.htm';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = load(response.data);
    const list = $('div.list_right_con ul li')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, 'http://gs.xjtu.edu.cn/').href,
                pubDate: parseDate($item.find('span.time').text()),
            };
        });

    return {
        title: '西安交通大学研究生院 - 通知公告',
        link: rootUrl,
        item: await pMap(
            list,
            async (item) => {
                try {
                    const detail = await cache.tryGet(`xjtu:gs:content:v3:${item.link}`, async () => {
                        const res = await got(item.link);
                        const content = load(res.data);
                        if (content('title').text() === 'Login - 西安交通大学统一身份认证网关' && content('form#fm1 input[name=password]').length === 1) {
                            throw new ArticleAccessError(`Article authentication required at ${item.link}`);
                        }
                        const body = content('#vsb_content, #vsb_content_503').first();
                        const article = body.html();
                        if (!article?.trim()) {
                            throw new Error(`Unable to find article content at ${item.link}`);
                        }
                        const description = article + (content('form ul').html() ?? '');
                        return { description };
                    });
                    return { ...item, ...detail };
                } catch (error) {
                    if (error instanceof ArticleAccessError) {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        ),
    };
}
