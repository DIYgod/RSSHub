import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { ProcessItem, rootUrl } from './utils';

export const route: Route = {
    path: '/user/:id',
    categories: ['new-media'],
    example: '/36kr/user/5652071',
    parameters: { id: '用户 ID，可从用户主页 URL 中获取' },
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
            source: ['36kr.com/user/:id'],
            target: '/user/:id',
        },
    ],
    name: '用户文章',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const apiUrl = 'https://gateway.36kr.com/api/mis/me/article';

    const response = await got.post(apiUrl, {
        json: {
            partner_id: 'web',
            timestamp: Date.now(),
            param: {
                userId: id,
                pageEvent: 0,
                pageSize: limit,
                pageCallback: '',
                siteId: 1,
                platformId: 2,
            },
        },
        headers: {
            'Content-Type': 'application/json',
            Origin: 'https://36kr.com',
            Referer: 'https://36kr.com/',
        },
    });

    const apiData = response.data;

    if (!apiData?.data?.itemList) {
        throw new Error('Failed to get user articles from API');
    }

    const data = apiData.data;
    const itemList = data.itemList;

    // 从第一篇文章中获取作者信息
    const firstItem = itemList.find((item) => item.templateMaterial || item.authorName);
    const authorName = firstItem?.authorName || firstItem?.templateMaterial?.authorName || `用户${id}`;

    let items = itemList
        .filter((item) => item.itemType !== 0)
        .map((item) => {
            const material = item.templateMaterial ?? item;
            return {
                title: (material.widgetTitle || material.title || '').replaceAll(/<\/?em>/g, ''),
                author: item.authorName || material.authorName || authorName,
                pubDate: parseDate(material.publishTime),
                link: `${rootUrl}/p/${item.itemId}`,
                description: material.widgetContent || material.summary || '',
                image: material.widgetImage || material.cover,
            };
        });

    items = await Promise.all(items.map((item) => ProcessItem(item, cache.tryGet)));

    return {
        title: `36氪 - ${authorName}的文章`,
        link: `${rootUrl}/user/${id}`,
        item: items,
    };
}
