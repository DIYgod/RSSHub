import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.shou.edu.cn';

const dict = {
    zbxx: '招标信息',
    tzgg: '通知公告',
    yw: '要闻',
    mtjj: '媒体聚焦',
    xsjz: '学术讲座',
    xsqy: '科技前沿',
};

export const route: Route = {
    path: '/www/:type',
    categories: ['university'],
    example: '/shou/www/tzgg',
    parameters: { type: '消息类型' },
    name: '官网信息',
    maintainers: ['Swung0x48'],
    handler,
    description: `| 通知公告 | 招标信息 | 要闻 | 媒体聚焦 | 学术讲座 | 科技前沿 |
| -------- | -------- | ---- | -------- | -------- | -------- |
| tzgg     | zbxx     | yw   | mtjj     | xsjz     | xsqy     |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const link = `${host}/${type}/list.htm`;

    const response = await ofetch(link);
    const $ = load(response);

    const items = await Promise.all(
        $('.col_news_item')
            .slice(0, 10)
            .toArray()
            .map((item) => {
                const $item = $(item);
                const itemUrl = new URL($item.find('.col_news_title a').attr('href')!, host).href;

                return cache.tryGet(itemUrl, async () => {
                    const detailResponse = await ofetch(itemUrl);
                    const $detail = load(detailResponse);

                    return {
                        title: $item.find('.col_news_title a').text(),
                        link: itemUrl,
                        guid: itemUrl,
                        pubDate: timezone(parseDate($item.find('.col_news_date').text()), 8),
                        description: $detail('.wp_articlecontent').text(),
                    };
                });
            })
    );

    return {
        title: `上海海洋大学 ${dict[type]}`,
        link,
        description: '上海海洋大学 官网信息',
        item: items,
    };
}
