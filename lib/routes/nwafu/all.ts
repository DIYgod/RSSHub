import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
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
    const response = await got.get(nwafuMap.get(type)[0]);
    const $ = load(response.data);
    const list = $(nwafuMap.get(type)[1])
        .toArray()
        .map((ele) => {
            const itemTitle = $(ele).find(nwafuMap.get(type)[2]).text();
            const itemPubDate = parseDate($(ele).find('span').text(), 'YYYY/MM/DD');
            const itemLink = new URL($(ele).find(nwafuMap.get(type)[2]).attr('href'), nwafuMap.get(type)[0]).toString();
            return {
                title: itemTitle,
                pubDate: itemPubDate,
                link: itemLink,
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (nwafuMap.get('forbiddenList').includes(new URL(item.link).hostname)) {
                    return item;
                }
                const detailResponse = await got.get(item.link);
                const $ = load(detailResponse.data);
                item.description = $(nwafuMap.get(type)[3]).html();
                return item;
            })
        )
    );

    return {
        title: nwafuMap.get(type)[4],
        link: nwafuMap.get(type)[0],
        description: nwafuMap.get(type)[4],
        item: out,
    };
}
