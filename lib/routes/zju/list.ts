import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.zju.edu.cn/';
export const route: Route = {
    path: '/list/:type',
    categories: ['university'],
    example: '/zju/list/xs',
    parameters: { type: '`xs`为学术，`xw`为新闻，`5461`是图片新闻，`578`是浙大报道，具体参数参考左侧的菜单' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '普通栏目 如学术 / 图片 / 新闻等',
    maintainers: ['Jeason0228'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'xs';
    const link = host + type + `/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = load(response.data);

    function sortUrl(e) {
        return e.search('redirect') === -1 ? e : link;
    }
    const list = $('#wp_news_w7 ul.news li')
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('a').attr('title'),
                link: sortUrl($(element).find('a').attr('href')),
                date: $(element)
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)[0],
            };
            return info;
        });

    const out = await Promise.all(
        list.map((info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = new URL(info.link, host).href;
            return cache.tryGet(itemUrl, async () => {
                const response = await got({
                    method: 'get',
                    url: itemUrl,
                    headers: {
                        Referer: link,
                    },
                });
                const $ = load(response.data);
                const description = $('.right_content').html();
                return {
                    title,
                    link: itemUrl,
                    description,
                    pubDate: parseDate(date),
                };
            });
        })
    );
    return {
        title: `浙江大学` + $('ul.submenu .selected').text(),
        link,
        item: out,
    };
}
