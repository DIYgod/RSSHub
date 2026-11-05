import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.jwc.uestc.edu.cn/';

const typeUrlMap = {
    important: 'tzgg.htm',
    student: 'tzgg/xsswgg.htm',
    teacher: 'tzgg/jsswgg.htm',
    teaching: 'tzgg/jxxw.htm',
    office: 'tzgg/jsswgg/bgsgg.htm',
};

const typeNameMap = {
    important: '通知公告',
    student: '学生事务公告',
    teacher: '教师事务公告',
    teaching: '教学新闻',
    office: '办公室公告',
};

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/uestc/jwc/student',
    parameters: { type: '默认为 `important`' },
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
            source: ['www.jwc.uestc.edu.cn/'],
            target: '/jwc',
        },
    ],
    name: '教务处',
    maintainers: ['achjqz', 'mobyw'],
    handler,
    url: 'www.jwc.uestc.edu.cn/',
    description: `\
| 通知公告  | 学生事务公告 | 教师事务公告 | 教学新闻 | 办公室公告 |
| --------- | ------------ | ------------ | -------- | ---------- |
| important | student      | teacher      | teaching | office     |`,
};

async function handler(ctx: Context): Promise<Data> {
    const type = ctx.req.param('type') || 'important';
    if (!Object.hasOwn(typeUrlMap, type)) {
        throw new InvalidParameterError('type not supported');
    }
    const typeName = typeNameMap[type];

    const currentUrl = baseUrl + typeUrlMap[type];
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('.newlist1 li > a')
        .toArray()
        .map((element): DataItem & { link: string } => {
            const item = $(element);
            return {
                title: item.attr('title') ?? item.find('h3').text(),
                link: new URL(item.attr('href')!, currentUrl).href,
                pubDate: timezone(parseDate(item.find('span').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const out = await pMap(
        list,
        (item) =>
            // nry.jsp links redirect to the campus login, so only the list entry is available
            item.link.includes('/nry.jsp')
                ? item
                : cache.tryGet(item.link, async () => {
                      const response = await ofetch(item.link);
                      const content = load(response);
                      item.description = content('.v_news_content').html() ?? undefined;
                      return item;
                  }),
        { concurrency: 3 }
    );

    return {
        title: `教务处通知（${typeName}）`,
        link: currentUrl,
        description: `电子科技大学教务处通知（${typeName}）`,
        item: out,
    };
}
