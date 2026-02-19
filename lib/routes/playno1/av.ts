import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { cookieJar, processArticle } from './utils';

const baseUrl = 'http://www.playno1.com';

export const route: Route = {
    path: '/av/:catid?',
    categories: ['bbs'],
    example: '/playno1/av',
    parameters: { catid: '分类，见下表，默认为全部文章' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'AV',
    maintainers: ['TonyRL'],
    handler,
    description: `::: warning
目前观测到该博客可能禁止日本 IP 访问。建议部署在日本区以外的服务器上。
:::

| 全部文章 | AV 新聞 | AV 導覽 |
| -------- | ------- | ------- |
| 78       | 3       | 5       |`,
};

async function handler(ctx) {
    const { catid = '78' } = ctx.req.param();
    const url = `${baseUrl}/portal.php?mod=list&catid=${catid}`;
    const response = await got(url, {
        cookieJar,
    });
    const $ = load(response.data);

    let items = $('.fire_float')
        .toArray()
        .filter((i) => $(i).text().length)
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3 a').attr('title'),
                link: item.find('h3 a').attr('href'),
                pubDate: timezone(parseDate(item.find('.fire_left').text()), 8),
                author: item
                    .find('.fire_right')
                    .text()
                    .match(/作者：(.*)\s*\|/)[1]
                    .trim(),
            };
        });

    items = await processArticle(items, cache);

    return {
        title: $('head title').text(),
        link: url,
        item: items,
        language: 'zh-TW',
    };
}
