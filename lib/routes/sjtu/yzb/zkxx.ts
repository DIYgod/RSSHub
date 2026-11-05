import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { fetchArticle } from '@/utils/wechat-mp';

const baseTitle = '上海交通大学研究生招生网招考信息';
const baseUrl = 'https://yzb.sjtu.edu.cn/zkxx/';

export const route: Route = {
    path: '/yzb/zkxx/:type',
    categories: ['university'],
    example: '/sjtu/yzb/zkxx/sszs',
    parameters: { type: '无默认选项' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生招生网招考信息',
    maintainers: ['stdrc'],
    handler,
    description: `| 博士招生 | 硕士招生 | 港澳台招生 | 考点信息 | 院系动态 |
| -------- | -------- | ---------- | -------- | -------- |
| bszs     | sszs     | gatzs      | kdxx     | yxdt     |`,
};

async function handler(ctx) {
    const pageUrl = `${baseUrl}${ctx.req.param('type')}`;

    const response = await ofetch(pageUrl);

    const $ = load(response);

    const list = $('.announcement-list > a.item')
        .toArray()
        .map((elem): DataItem & { link: string } => {
            const $item = $(elem);
            const month = $item.find('.month').text().trim();
            const day = $item.find('.day').text().trim();
            return {
                link: new URL(elem.attribs.href, pageUrl).href,
                title: $item.find('.title').text(),
                pubDate: month && day ? parseDate(`${month}.${day} +0000`, 'YYYY.MM.DD ZZ') : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`sjtu:yzb:v2:${item.link}`, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    return await fetchArticle(item.link);
                }
                if (new URL(item.link).hostname === 'www.shmeea.edu.cn') {
                    const detailResponse = await ofetch(item.link.replace('http://', 'https://'));
                    const content = load(detailResponse);
                    return { description: content('.Article_content').html() };
                }
                if (new URL(item.link).hostname === 'yzb.sjtu.edu.cn') {
                    const detailResponse = await ofetch(item.link);
                    const content = load(detailResponse);
                    const published = content('.article-otherBase')
                        .text()
                        .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                    return {
                        description: content('.mce-content-body').html(),
                        pubDate: published ? parseDate(`${published} +0000`, 'YYYY-MM-DD ZZ') : undefined,
                    };
                }
                return {};
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        link: pageUrl,
        title: `${baseTitle} -- ${$('title').text().split('-', 1)[0]}`,
        item: items,
    };
}
