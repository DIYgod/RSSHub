import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: ['/zh/:type?', '/ff14_zh/:type?'],
    categories: ['game'],
    example: '/ff14/zh/news',
    parameters: { type: '分类名，预设为 `all`' },
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
            source: ['ff.web.sdo.com/web8/index.html'],
            target: '/zh',
        },
    ],
    name: '最终幻想 14 国服',
    maintainers: ['Kiotlin', 'ZeroClad', '15x15G'],
    handler,
    url: 'ff.web.sdo.com/web8/index.html',
    description: `| 新闻 | 公告     | 活动   | 广告      | 所有 |
| ---- | -------- | ------ | --------- | ---- |
| news | announce | events | advertise | all  |`,
};

async function handler(ctx) {
    const referer = 'https://ff.sdo.com/web8/index.html';
    const type = ctx.req.param('type') ?? 'all';

    const typeNumber: Record<string, string> = {
        news: '5310',
        announce: '5312,8324,8325,8326,8327',
        events: '5311',
        advertise: '5313',
    };

    typeNumber.all = `5309,${Object.values(typeNumber).join(',')}`;

    const response = await got({
        method: 'get',
        url: `http://api.act.sdo.com/UnionNews/List?gameCode=ff&category=${typeNumber[type]}&pageIndex=0&pageSize=50`,
        headers: {
            Referer: referer,
        },
    });

    const data = response.data.Data;

    return {
        title: '最终幻想14（国服）新闻中心',
        link: referer + '#/newstab/newslist',
        description: '《最终幻想14》是史克威尔艾尼克斯出品的全球经典游戏品牌FINAL FANTASY系列的最新作品，IGN获得9.2高分！全球累计用户突破1600万！',
        item: data.map(({ Title, Summary, Author, PublishDate, HomeImagePath, Id }) => ({
            title: Title,
            link: Author || `https://ff.web.sdo.com/web8/index.html#/newstab/newscont/${Id}`,
            description: renderDescription({
                image: HomeImagePath,
                description: Summary,
            }),
            pubDate: timezone(parseDate(PublishDate), +8),
        })),
    };
}
