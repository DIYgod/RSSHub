import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/niaogebiji',
    radar: [
        {
            source: ['niaogebiji.com/', 'niaogebiji.com/bulletin'],
            target: '',
        },
    ],
    name: '首页',
    maintainers: ['WenryXu'],
    handler,
    url: 'niaogebiji.com/',
};

type Article = { title: string; summary: string; author: string; published_at: string; updated_at: string; catname: string; tag_list: string[]; link: string };

async function handler() {
    const baseUrl = 'https://www.niaogebiji.com';
    const { data: response }: { data: { return_code: string; return_msg: string; return_data: Article[] } } = await got(`${baseUrl}/pc/index/getMoreArticle`);

    if (response.return_code !== '200') {
        throw new Error(response.return_msg);
    }

    const postList = response.return_data.map((item): DataItem & { link: string } => ({
        title: item.title,
        description: item.summary,
        author: item.author,
        pubDate: parseDate(item.published_at, 'X'),
        updated: parseDate(item.updated_at, 'X'),
        category: [item.catname, ...item.tag_list],
        link: new URL(item.link, baseUrl).href,
    }));

    const result = await pMap(
        postList,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`niaogebiji:home:details:v2:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                return { description: $('.pc_content').html() };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '鸟哥笔记',
        link: baseUrl,
        item: result,
    };
}
