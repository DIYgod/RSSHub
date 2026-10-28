import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { fetchArticle as fetchWechatArticle } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/gzhu/yjs',
    parameters: {},
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
            source: ['yjsy.gzhu.edu.cn/zsxx/zsdt.htm', 'yjsy.gzhu.edu.cn/'],
        },
    ],
    name: '研究生院招生动态',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yjsy.gzhu.edu.cn/zsxx/zsdt.htm',
};

async function handler() {
    const link = 'https://yjsy.gzhu.edu.cn/zsxx/zsdt.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.text-list li');

    const items = list.toArray().map((item): DataItem & { link: string } => {
        const $item = $(item);
        const a = $item.children('a');
        const month = $item.find('.date span').text().trim();
        const day = $item.find('.date b').text().trim();
        const date = /^\d{4}-\d{2}$/.test(month) && /^\d{1,2}$/.test(day) ? parseDate(`${month}-${day.padStart(2, '0')}T00:00:00+08:00`) : undefined;
        return {
            title: a.find('h3').text(),
            description: a.find('.tx p').html() ?? undefined,
            link: new URL(a.attr('href')!, link).href,
            pubDate: date && !Number.isNaN(date.getTime()) ? date : undefined,
        };
    });

    return {
        title: '广州大学研究生院',
        link,
        description: '广州大学研招网通知公告',
        item: await pMap(
            items,
            async (item) => {
                const host = new URL(item.link).hostname;
                if (host === 'mp.weixin.qq.com') {
                    const article = await fetchWechatArticle(item.link);
                    return { ...item, description: article.description };
                }
                if (host !== new URL(link).hostname) {
                    return item;
                }
                const article = await cache.tryGet(`gzhu:article:${item.link}`, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    const content = $('#vsb_content');
                    if (!content.length) {
                        throw new Error(`Cannot find the article content at ${item.link}.`);
                    }
                    return { description: content.html() ?? undefined };
                });
                return { ...item, ...article };
            },
            { concurrency: 3 }
        ),
    };
}
