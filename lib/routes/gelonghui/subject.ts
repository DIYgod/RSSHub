import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseItem } from './utils';

export const route: Route = {
    path: '/subject/:id',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/gelonghui/subject/4',
    parameters: { id: '主题编号，可在主题页 URL 中找到' },
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
            source: ['gelonghui.com/subject/:id'],
        },
    ],
    name: '主题文章',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const apiUrl = `https://www.gelonghui.com/api/subjects/${id}/contents`;
    const pageUrl = `https://www.gelonghui.com/subject/${id}`;
    const { data: response } = await got(pageUrl);
    const { data } = await got(apiUrl, {
        searchParams: {
            isChoice: false,
        },
    });

    const $ = load(response);

    const list = data.result.map((item) => ({
        title: item.title,
        description: item.summary,
        link: item.link,
        author: item.source,
        pubDate: parseDate(item.timestamp, 'X'),
    }));

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: `格隆汇 - 主题 ${$('span.user-nick').text()} 的文章`,
        description: $('div.user-name').parent().children('p').text(),
        image: $('.subject-list-title').find('img').attr('data-src'),
        link: `https://www.gelonghui.com/subject/${id}`,
        item: items,
    };
}
