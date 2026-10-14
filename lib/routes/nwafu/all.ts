import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { nwafuMap } from './utils';

export const route: Route = {
    path: '/:type?',
    categories: ['university'],
    example: '/nwafu/lib',
    parameters: { type: '默认为 `jiaowu`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '校园要闻',
    maintainers: ['karinido'],
    handler,
    description: `通知类别

| 图书馆 | 共青团团委 | 信工学院 | 后勤管理处 | 计划财务处 | 教务处 | 新闻网 | 信息化管理处 | 研究生院 | 农业科学院 | 机械与电子工程学院 | 学术活动 | 生命科学学院 |
| ------ | ---------- | -------- | ---------- | ---------- | ------ | ------ | ------------ | -------- | ---------- | ------------------ | -------- | ------------ |
| lib    | youth      | cie      | gs         | jcc        | jiaowu | news   | nic          | yjshy    | nxy        | cmee               | xshd     | sm           |`,
};

async function handler(ctx) {
    const { type = 'jiaowu' } = ctx.req.param();
    const selected = nwafuMap.get(type);
    if (!selected || type === 'forbiddenList') {
        throw new InvalidParameterError(`Unknown NWAFU category: ${type}. Choose one of the documented categories.`);
    }
    const response = await got.get(selected[0]);
    const $ = load(response.data);
    const list = $(selected[1])
        .toArray()
        .map((ele): DataItem => {
            const itemTitle = $(ele).find(selected[2]).text();
            const itemPubDate = parseDate($(ele).find('span').text(), 'YYYY/MM/DD');
            const itemLink = new URL($(ele).find(selected[2]).attr('href')!, selected[0]).href;
            return {
                title: itemTitle,
                pubDate: itemPubDate,
                link: itemLink,
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                if (nwafuMap.get('forbiddenList')!.includes(new URL(item.link!).hostname)) {
                    return item;
                }
                const detailResponse = await got.get(item.link);
                const $ = load(detailResponse.data);
                item.description = $(selected[3]).html();
                return item;
            })
        )
    );

    return {
        title: selected[4],
        link: selected[0],
        description: selected[4],
        item: out,
    };
}
