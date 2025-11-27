import { JSDOM } from 'jsdom';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';

export const route: Route = {
    path: '/kg/:userId',
    categories: ['social-media'],
    example: '/qq/kg/639a9a86272c308e33',
    parameters: { userId: '用户 ID, 可在对应页面的 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '用户作品列表',
    maintainers: ['zhangxiang012'],
    handler,
};

async function handler(ctx) {
    const userId = ctx.req.param('userId');
    const url = `https://node.kg.qq.com/personal?uid=${userId}`;
    const response = await got(url);

    const { window } = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });
    const data = window.__DATA__;
    const author = data.data.nickname;
    const authorimg = data.data.head_img_url;
    const ugcList = data.data.ugclist;

    const items = await Promise.all(
        ugcList.map(async (item) => {
            const link = `https://node.kg.qq.com/play?s=${item.shareid}`;
            const item_info = await cache.getPlayInfo(ctx, item.shareid, item.ksong_mid);

            const single = {
                title: item.title || '',
                description: item_info.description,
                link,
                guid: `ksong:${item.ksong_mid}`,
                author,
                pubDate: parseDate(item_info.ctime * 1000) || parseDate(item.ctime, 'X'),
                itunes_item_image: item_info.itunes_item_image || item.avatar,
                enclosure_url: item_info.enclosure_url,
                enclosure_type: 'audio/x-m4a',
            };

            return single;
        })
    );

    return {
        title: `${author} - 全民K歌`,
        link: url,
        description: data.share.content,
        allowEmpty: true,
        item: items,
        image: authorimg,
        itunes_author: author,
        itunes_category: '全民K歌',
    };
}
