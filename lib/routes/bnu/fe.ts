import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/fe/:category',
    categories: ['university'],
    example: '/bnu/fe/18',
    parameters: { category: '分类编号，目前支持 `18`（培养动态）' },
    radar: [
        {
            source: ['fe.bnu.edu.cn/jyjx/pydt/index.htm'],
            target: '/fe/18',
        },
    ],
    name: '教育学部-培养动态',
    maintainers: ['etShaw-zh'],
    handler,
    description: '订阅教育学部当前网站的培养动态栏目。旧网站分类编号 `18` 保持兼容；其他旧分类编号尚未确认对应栏目。',
};

async function handler(ctx) {
    const { category } = ctx.req.param();
    if (category !== '18') {
        throw new InvalidParameterError('The education faculty website has moved. Only category 18 (培养动态) is currently mapped to the new site.');
    }
    const link = 'https://fe.bnu.edu.cn/jyjx/pydt/index.htm';
    const { data } = await got(link);
    const $ = load(data);
    const list = $('.people_list')
        .toArray()
        .map((element): DataItem => {
            const $element = $(element);
            const anchor = $element.find('a.people_list_a');
            return {
                title: anchor.text(),
                link: new URL(anchor.attr('href')!, link).href,
                pubDate: timezone(parseDate($element.find('.mian_div_icon_p01').text(), 'YYYY-MM-DD'), 8),
            };
        });
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data } = await got(item.link);
                const $ = load(data);
                item.description = $('.news02_div').html();
                item.author = $('.mian_div_icon_p07').text();
                return item;
            }),
        { concurrency: 3 }
    );
    return {
        title: '北京师范大学教育学部-培养动态',
        link,
        description: '北京师范大学教育学部-培养动态最新通知',
        item: items,
    };
}
