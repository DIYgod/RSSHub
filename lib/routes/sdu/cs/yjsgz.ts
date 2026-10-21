import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { finishArticleItem } from '@/utils/wechat-mp';

const host = 'https://csyh.sdu.edu.cn/';
const typeMap = {
    zytz: 'zytz.htm',
    gsl: 'gsl.htm',
};
const titleMap = {
    zytz: '重要通知',
    gsl: '公示栏',
};

export const route: Route = {
    path: '/cs/yjsgz/:type?',
    categories: ['university'],
    example: '/sdu/cs/yjsgz/zytz',
    parameters: { type: '默认为`zytz`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机科学与技术学院研究生工作网站',
    maintainers: ['kukeya', 'wiketool'],
    handler,
    description: `| 重要通知 | 公示栏 |
| -------- | ------ |
| zytz     | gsl    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'zytz';

    const link = new URL(typeMap[type], host).href;

    const response = await got(link);

    const $ = load(response.data);

    let item = $('.ss li')
        .toArray()
        .map((e): DataItem => {
            const $e = $(e);
            const a = $e.find('a');
            return {
                title: a.text().trim(),
                link: a.attr('href')!.startsWith('info/') ? host + a.attr('href') : a.attr('href'),
                pubDate: parseDateInTimezone($e.find('span').text().trim(), 8),
            };
        });

    item = await pMap(
        item,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`cs-yjsgz:article-v2:${item.link}`, async () => {
                const hostname = new URL(item.link!).hostname;
                if (hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(item);
                }
                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('.v_news_content').html();

                return { description: item.description };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: `山东大学计算机科学与技术学院研究生工作网站${titleMap[type]}`,
        description: $('title').text(),
        link,
        item,
    };
}
