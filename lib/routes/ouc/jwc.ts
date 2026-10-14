import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const jwcGot = got.extend({ allowH2: false });

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/ouc/jwc',
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
            source: ['jwc.ouc.edu.cn/', 'jwc.ouc.edu.cn/6517/list.htm'],
        },
    ],
    name: '教务处',
    maintainers: ['3401797899'],
    handler,
    url: 'jwc.ouc.edu.cn/',
};

class LoginRequiredError extends Error {}

async function handler() {
    const link = 'https://jwc.ouc.edu.cn/6517/list.htm';
    const response = await jwcGot(link);
    const $ = load(response.data);
    const list = $('.wp_article_list li')
        .toArray()
        .map((e): DataItem & { link: string } => {
            const $e = $(e);
            const a = $e.find('a');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, 'https://jwc.ouc.edu.cn').href,
                pubDate: timezone(parseDate($e.find('span.Article_PublishDate').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const out = await pMap(
        list,
        async (item) => {
            try {
                const description = await cache.tryGet(`ouc:article:body:${item.link}`, async () => {
                    const response = await jwcGot(item.link);
                    const $ = load(response.data);
                    const description = $('.wp_articlecontent').html();
                    if (!description && $('title').text() === '统一身份认证') {
                        throw new LoginRequiredError('This notice requires campus authentication');
                    }
                    if (!description) {
                        throw new Error(`Unable to find notice content at ${item.link}`);
                    }
                    return description;
                });
                return { ...item, author: '中国海洋大学教务处', description };
            } catch (error) {
                if (error instanceof LoginRequiredError) {
                    return { ...item, author: '中国海洋大学教务处' };
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '中国海洋大学教务处',
        link,
        description: '中国海洋大学教务处最新通知',
        item: out,
    };
}
