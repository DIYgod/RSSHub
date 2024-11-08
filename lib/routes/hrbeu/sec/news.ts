import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/sec/:id',
    categories: ['university'],
    example: '/hrbeu/sec/tzgg',
    parameters: { id: '栏目编号，在 URL 中获取。' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['sec.hrbeu.edu.cn/229/list.htm', 'sec.hrbeu.edu.cn/', 'sec.hrbeu.edu.cn/xshd/list.htm'],
        },
    ],
    name: '船舶工程学院',
    maintainers: ['Chi-hong22'],
    handler,
    description: `| 通知公告 | 学术活动 |
                | :------: | :------: |
                |   tzgg   |   xshd  |`,
};

const pageMap = {
    tzgg: '229', // 通知公告对应的页面 ID
    xshd: 'xshd', // 学术活动对应的页面 ID
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const pageId = pageMap[id];
    if (!pageId) {
        throw new Error('Invalid id');
    }

    const host = 'https://sec.hrbeu.edu.cn';
    const url = `${host}/${pageId}/list.htm`;

    const response = await got(url, {
        headers: {
            Referer: host,
        },
    });

    const $ = load(response.data);
    const title = $('title').text().split('-')[0].trim();

    const items = $('.news_list li')
        .map((_, item) => {
            const link = new URL($(item).find('a').attr('href'), host).href;
            const title = $(item).find('a').text().trim();
            const pubDate = parseDate($(item).find('.news_meta').text().trim());
            return {
                title,
                pubDate,
                link,
                description:'',
            };
        })
        .toArray();

    const item = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const resp = await got(item.link);
                const $1 = load(resp.data);
                item.description = $1('.wp_articlecontent').html() ?? '';
                return item;
            })
        )
    );

    return {
        title: `船舶工程学院 - ${title}`,
        link: url,
        item,
    };
}
