import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.supplywater.com';

export const route: Route = {
    path: '/changsha/:channelId?',
    categories: ['forecast'],
    example: '/tingshuitz/changsha/78',
    parameters: { channelId: 'N' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '长沙市',
    maintainers: ['shansing'],
    handler,
    description: `可能仅限于中国大陆服务器访问，以实际情况为准。

| channelId | 分类     |
| --------- | -------- |
| 78        | 计划停水 |
| 157       | 抢修停水 |`,
};

async function getArticleDetails(link: string): Promise<Pick<DataItem, 'author' | 'description' | 'pubDate'>> {
    const details = await cache.tryGet(link, async () => {
        const postPage = await got(link);
        const $ = load(postPage.data);
        const publishedDate = $('.mainRightBox .gxsj span:first').text();
        return {
            description: $('.mainRightBox div:last').html()!.trim(),
            pubDate: publishedDate.trim() ? parseDate(publishedDate + ' +0800', 'YYYY/M/D H:m:s ZZ') : undefined,
            author: $('.mainRightBox .gxsj span:last').text(),
        };
    });
    return { author: details.author, description: details.description, pubDate: details.pubDate };
}

async function handler(ctx) {
    const { channelId = 78 } = ctx.req.param();
    const listPage = await got('http://www.supplywater.com/tstz-' + channelId + '.aspx');
    const $ = load(listPage.data);
    const pageName = $('.mainRightBox .news-title').text();
    const list = $('.mainRightBox .announcements-title a')
        .toArray()
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: baseUrl + $item.attr('href')!.trim(),
            };
        });

    const items = await pMap(list, async (item) => ({ ...item, ...(await getArticleDetails(item.link)) }), { concurrency: 3 });

    return {
        title: `${pageName}通知 - 长沙水业集团`,
        link: `${baseUrl}/fuwuzhinan.aspx`,
        item: items,
    };
}
