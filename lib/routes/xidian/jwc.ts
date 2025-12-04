import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://jwc.xidian.edu.cn';

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/xidian/jwc/tzgg',
    parameters: { category: '通知类别，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    url: 'jwc.xidian.edu.cn',
    maintainers: ['ShadowySpirits'],
    handler,
    description: `| 教学信息 | 教学研究 | 实践教学 | 质量监控 | 通知公告 |
| :------: | :------: | :------: | :------: | :------: |
|   jxxx   |   jxyj   |   sjjx   |   zljk   |   tzgg   |`,
};

async function handler(ctx) {
    const { category = 'tzgg' } = ctx.req.param();
    const url = `${baseUrl}/${category}.htm`;
    const response = await got(url, {
        headers: {
            referer: baseUrl,
        },
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response.data);

    let items = $('.list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.con span').text()),
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
                content('.tit, .zd, #div_vote_id').remove();
                item.description = content('.con').html();
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
