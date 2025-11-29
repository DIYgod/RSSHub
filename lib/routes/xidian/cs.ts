import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://cs.xidian.edu.cn';

const struct = {
    xyxw: {
        selector: {
            list: '.n_wenzhang ul li',
        },
        name: '主页-学院新闻',
        path: '/xyxw',
    },
    tzgg: {
        selector: {
            list: '.n_wenzhang ul li',
        },
        name: '主页-通知公告',
        path: '/tzgg',
    },
    jlhz1: {
        selector: {
            list: '.n_wenzhang ul li',
        },
        name: '主页-交流合作',
        path: '/jlhz1',
    },
    rsrc: {
        selector: {
            list: '.n_wenzhang ul li',
        },
        name: '主页-人事人才',
        path: 'rsrc',
    },
    bkjy_jxxw: {
        selector: {
            list: '.n_wenzhang ul li',
        },
        name: '主页-本科生教育 / 本科教育-教学新闻',
        path: 'bkjy/jxxw',
    },
    yjsjy_yjstz: {
        selector: {
            list: '.n_wenzhang ul li',
        },
        name: '主页-研究生教育 / 研究生教育-研究生通知',
        path: 'yjsjy/yjstz',
    },
    jyzhaop: {
        selector: {
            list: '.n_wenzhang ul li',
        },
        name: '主页-就业招聘',
        path: 'jyzhaop',
    },
};

export const route: Route = {
    path: '/cs/:category?',
    categories: ['university'],
    example: '/xidian/cs/xyxw',
    parameters: { category: '通知类别，默认为主页-学院新闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机科学与技术学院',
    url: 'cs.xidian.edu.cn',
    maintainers: ['ZiHao256'],
    handler,
    description: `| 文章来源                   | 参数          |
| ---------------------- | ----------- |
| ✅主页-学院新闻                | xyxw        |
| ✅主页-通知公告                | tzgg        |
| ✅主页-交流合作                | jlhz1       |
| ✅主页-人事人才                | rsrc        |
| ✅主页-本科生教育 / 本科教育-教学新闻   | bkjy_jxxw   |
| ✅主页-研究生教育 / 研究生教育-研究生通知 | yjsjy_yjstz |
| ✅主页-就业招聘                | jyzhaop     |`,
    radar: [
        {
            source: ['cs.xidian.edu.cn/'],
        },
    ],
};

async function handler(ctx) {
    const { category = 'xyxw' } = ctx.req.param();
    const url = `${baseUrl}/${struct[category].path}.htm`;
    const response = await got(url, {
        headers: {
            referer: baseUrl,
        },
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    let items = $(struct[category].selector.list)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        referer: url,
                    },
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = load(detailResponse.data);
                content('.content-sxt').remove();
                item.description = content('[name="_newscontent_fromname"]').html();
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
