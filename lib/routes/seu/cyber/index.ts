import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cyber/tzgg',
    categories: ['university'],
    example: '/seu/cyber/tzgg',
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
            source: ['cyber.seu.edu.cn/tzgg/list.htm', 'cyber.seu.edu.cn/'],
        },
    ],
    name: '网络空间安全学院 - 通知公告',
    maintainers: ['shrugginG'],
    handler,
    description: '东南大学网络空间安全学院通知公告',
};

async function handler() {
    const host = 'https://cyber.seu.edu.cn';
    const link = `${host}/tzgg/list.htm`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.col_news_list .news_list .news')
        .toArray()
        .map((item) => {
            const e = $(item);
            const a = e.find('.news_title a');
            const title = a.text();
            const href = a.attr('href');
            const dateText = e.find('.news_meta').text().trim();

            return {
                title,
                link: new URL(href || '', host).href,
                pubDate: dateText ? timezone(parseDate(dateText, 'YYYY.MM.DD'), 8) : undefined,
                description: '',
            };
        });

    const out = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await recoverArticle(
                cache.tryGet(`seu:cyber:article-v4:${item.link}`, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    return { description: $('.wp_articlecontent').html() || $('.article-content').html() || $('.main-text').html() || $('article').html() || '' };
                })
            )),
        }),
        { concurrency: 3 }
    );

    return {
        link,
        title: '东南大学网络空间安全学院 - 通知公告',
        description: '东南大学网络空间安全学院通知公告RSS',
        item: out,
    };
}

async function recoverArticle<T>(promise: Promise<T>) {
    try {
        return await promise;
    } catch (error) {
        if (error instanceof FetchError) {
            return { description: '' };
        }
        throw error;
    }
}
