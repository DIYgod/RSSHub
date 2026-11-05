import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.tynu.edu.cn';

function getPublicationDate(value: string): Date | undefined {
    if (!value) {
        return;
    }
    const date = parseDate(value, 'YYYYMM-DD', true);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function getArticleItem(item: DataItem & { link: string }): Promise<DataItem> {
    const detail = await cache.tryGet<Pick<DataItem, 'description'>>(item.link, async () => {
        const response = await got(item.link);
        const $ = load(response.data);
        return { description: $('#vsb_content').html() + ($('.content ul').not('.btm-cate').html() || '') };
    });
    return { ...item, description: detail.description };
}

export const route: Route = {
    path: '/',
    categories: ['university'],
    example: '/tynu',
    radar: [
        {
            source: ['tynu.edu.cn/index/tzgg.htm', 'tynu.edu.cn/index.htm', 'tynu.edu.cn/'],
            target: '',
        },
    ],
    name: '通知公告',
    maintainers: ['2PoL'],
    handler,
    url: 'tynu.edu.cn/index/tzgg.htm',
};

async function handler() {
    const link = `${baseUrl}/index/tzgg.htm`;
    const response = await got(link);
    const data = response.data;

    const $ = load(data);
    const list = $('.news_content_list')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.find('h3').text(),
                link: new URL($item.find($('a')).attr('href')!, baseUrl).href,
                pubDate: getPublicationDate($item.find('.content_list_time').text()),
            };
        });

    const items = await pMap(list, getArticleItem, { concurrency: 3 });

    return {
        title: '太原师范学院通知公告',
        link,
        item: items,
    };
}
