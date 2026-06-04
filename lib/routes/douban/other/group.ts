import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/group/:groupid/:type?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/douban/group/648102',
    parameters: {
        groupid: '豆瓣小组的 id',
        type: {
            description: '类型',
            default: 'latest',
            options: [
                {
                    label: '最新',
                    value: 'latest',
                },
                {
                    label: '最热',
                    value: 'essence',
                },
                {
                    label: '精华',
                    value: 'elite',
                },
            ],
        },
    },
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
            source: ['www.douban.com/group/:groupid'],
            target: '/group/:groupid',
        },
    ],
    name: '豆瓣小组',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const groupid = ctx.req.param('groupid');
    const type = ctx.req.param('type');

    const url = `https://www.douban.com/group/${groupid}/${type && type !== 'latest' ? `?type=${type}` : ''}`;
    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const list = $('.olt tr:not(.th)').slice(0, 30).toArray();

    const items = await Promise.all(
        list.map((item) => {
            const $1 = $(item);
            const result = {
                title: $1.find('.title a').attr('title'),
                author: $1.find('a').eq(1).text(),
                link: $1.find('.title a').attr('href'),
            };
            return cache.tryGet(result.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: result.link,
                    });
                    const $ = load(detailResponse.data);

                    result.pubDate = $('.create-time').text();
                    result.description = $('.rich-content').html();
                    return result;
                } catch {
                    return result;
                }
            });
        })
    );

    return {
        title: `豆瓣小组-${$('h1').text().trim()}`,
        link: url,
        item: items,
    };
}
