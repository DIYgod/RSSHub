import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwb/:type?',
    categories: ['university'],
    example: '/dgut/jwb/jwtz',
    parameters: { type: '哪种通知，默认为教务通知' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    maintainers: ['korokor0', '1200522928'],
    radar: [
        {
            source: ['jwb.dgut.edu.cn/tzgg/'],
            target: '',
        },
    ],
    name: '教务部通知公告',
    description: `| 教学动态 | 教务通知 | 教研通知 | 实践通知 | 产业学院 | 通识教育 | "杨振宁" 班 | 招生信息 | 采购公告 |
| -------- | -------- | -------- | -------- | -------- | -------- | ----------- | -------- | -------- |
| jxdt     | jwtz     | jytz     | sjtz     | cyxy     | tsjy     | yznb        | zsxx     | cggg     |`,
    handler,
};

async function handler(ctx: Context) {
    const { type = 'jwtz' } = ctx.req.param();
    if (!['jxdt', 'jwtz', 'jytz', 'sjtz', 'cyxy', 'tsjy', 'yznb', 'zsxx', 'cggg'].includes(type)) {
        throw new InvalidParameterError('Invalid notification type. Use one of the types documented for this route.');
    }
    const url = `https://jwb.dgut.edu.cn/tzgg/${type}.htm`;
    const baseurl = 'https://jwb.dgut.edu.cn/';

    const response = await ofetch(url);
    const $ = load(response);
    const list = $('ul.ul-new4 > li')
        .toArray()
        .map((item) => {
            const $li = $(item);
            const $a = $li.find('a.con');
            return {
                title: $a.find('.tit').text(),
                pubDate: timezone(parseDate(`${$a.find('.year').text()}-${$a.find('.day').text()}`), 8),
                link: `${baseurl}${$a.attr('href')}`,
            };
        });

    const ordered = list;
    const items = await pMap(
        ordered,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                return {
                    ...item,
                    description: $('div.v_news_content').html(),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
