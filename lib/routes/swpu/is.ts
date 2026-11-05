import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/is/:code',
    categories: ['university'],
    example: '/swpu/is/xyxw',
    parameters: { code: '栏目代码' },
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
            title: '信息学院 - 学院新闻',
            source: ['www.swpu.edu.cn/is/xydt/xyxw.htm'],
            target: '/is/xyxw',
        },
        {
            title: '信息学院 - 通知公告',
            source: ['www.swpu.edu.cn/is/xydt/tzgg.htm'],
            target: '/is/tzgg',
        },
    ],
    name: '信息学院',
    maintainers: ['RiverTwilight'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 学院新闻 | 通知公告 | 教育教学 | 学生工作 | 招生就业 |
| ---- | -------- | -------- | -------- | -------- | -------- |
| 代码 | xyxw     | tzgg     | jyjx     | xsgz     | zsjy     |`,
};

async function getArticle(link: string): Promise<Pick<DataItem, 'author' | 'description'>> {
    const details: Pick<DataItem, 'author' | 'description'> = {};
    const res = await got(link);
    const $ = load(res.data);
    if (!$('title').text().startsWith('系统提示')) {
        const content = $('.v_news_content');
        details.description = content.html();
        const author = content
            .closest('form')
            .find('h3 + div')
            .text()
            .match(/作者：([\s\S]*?)编辑：/)?.[1]
            .trim();
        if (author) {
            details.author = author;
        }
    }

    return details;
}

async function handler(ctx): Promise<Data> {
    const url = `https://www.swpu.edu.cn/is/xydt/${ctx.req.param('code')}.htm`;

    const res = await got(url);
    const $ = load(res.data);

    let title = $('title').text();
    title = title.slice(0, title.indexOf('-'));

    const items = $('tr[height="20"]')
        .toArray()
        .map((elem): DataItem & { link: string } => ({
            title: $('a[title]', elem).text(),
            pubDate: $('span[class^="timestyle"]', elem).text().trim() ? timezone(parseDate($('span[class^="timestyle"]', elem).text(), 'YYYY/MM/DD'), 8) : undefined,
            link: `https://www.swpu.edu.cn/is/${$('a[href]', elem).attr('href')!.split('../', 2)[1]}`,
        }));

    const out = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`swpu:is:article:v3:${item.link}`, () => getArticle(item.link))),
        }),
        { concurrency: 3 }
    );

    return {
        title: `西南石油大学信息学院 ${title}`,
        link: url,
        description: `西南石油大学信息学院 ${title}`,
        language: 'zh-CN',
        item: out,
    };
}
