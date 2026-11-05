import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://zhaopin.ucas.ac.cn';

const idMap = {
    jxkyrc: 3,
    glzcrc: 4,
    ktxmpy: 5,
    bsh: 6,
};

const titleMap = {
    jxkyrc: '教学科研人才',
    glzcrc: '管理支撑人才',
    ktxmpy: '课题项目聘用',
    bsh: '博士后',
};

export const route: Route = {
    path: '/job/:type?',
    categories: ['university'],
    example: '/ucas/job',
    parameters: { type: '招聘类型，默认为博士后' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['zhaopin.ucas.ac.cn/gjob/login.do'], title: '博士后', target: '/job/bsh' },
        { source: ['zhaopin.ucas.ac.cn/gjob/login.do'], title: '课题项目聘用', target: '/job/ktxmpy' },
        { source: ['zhaopin.ucas.ac.cn/gjob/login.do'], title: '管理支撑人才', target: '/job/glzcrc' },
        { source: ['zhaopin.ucas.ac.cn/gjob/login.do'], title: '教学科研人才', target: '/job/jxkyrc' },
    ],
    name: '招聘信息',
    maintainers: ['Fatpandac'],
    handler,
    description: `| 招聘类型 | 博士后 | 课题项目聘用 | 管理支撑人才 | 教学科研人才 |
| :------: | :----: | :----------: | :----------: | :----------: |
|   参数   |   bsh  |    ktxmpy    |    glzcrc    |    jxkyrc    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'bsh';
    if (!Object.hasOwn(idMap, type)) {
        throw new InvalidParameterError('Invalid recruitment type. Use jxkyrc, glzcrc, ktxmpy, or bsh.');
    }
    const url = `${rootUrl}/gjob/login.do?method=contentList&t=zhaopin&c=${idMap[type]}`;
    const response = await got.get(url);

    const $ = load(response.data);
    const list = $('#col1_content > div.list > ul > li').toArray();

    const items = await pMap(
        list,
        async (item) => {
            const title = $(item).find('a').attr('title');
            const link = rootUrl + $(item).find('a').attr('href');
            const date = parseDate($(item).find('span').text().trim(), 'YYYY.MM.DD', true);
            const pubDate = Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);

            const desc = await cache.tryGet(link, async () => {
                const response = await got.get(link);
                const pageContent = load(response.data);

                const descDeadline = pageContent('#col1_content > div.content_head > div.top').html();
                const descContent = pageContent('#col1_content > div.entry').html();
                const desc = descDeadline! + descContent!;
                return desc;
            });

            return {
                title: title!,
                link,
                pubDate,
                description: desc,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `中国科学院大学招聘 - ${titleMap[type]}`,
        link: url,
        item: items,
    };
}
