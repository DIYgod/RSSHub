import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function extractAuthor(value: string): string | undefined {
    for (const marker of value.matchAll(/作者：/g)) {
        const tail = value.slice(marker.index + marker[0].length).trimStart();
        const sourceIndex = tail.indexOf('来源：');
        if (sourceIndex === -1) {
            continue;
        }
        const candidate = tail.slice(0, sourceIndex).trimEnd();
        if (!/[\r\n\u{2028}\u{2029}]/u.test(candidate)) {
            return candidate || undefined;
        }
    }
}

const titleMap = {
    tzgg: '通知公告',
    zsxx: '硕士招生信息',
    pyxx: '研究生培养信息',
};
const descriptionMap = {
    tzgg: '通知公告',
    zsxx: '硕士招生信息',
    pyxx: '研究生培养信息',
};
const urlMap = {
    tzgg: 'tzgg',
    zsxx: 'zsxx/sszsxx',
    pyxx: 'pyxx/pyxx',
};

export const route: Route = {
    path: '/master/:type',
    categories: ['university'],
    example: '/ncepu/master/tzgg',
    parameters: { type: '类型参数' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '北京校区研究生院',
    maintainers: ['nilleo'],
    handler,
    description: `| 类型 | 硕士招生信息 | 通知公告 | 研究生培养信息 |
| ---- | ------------ | -------- | -------------- |
| 参数 | zsxx         | tzgg     | pyxx           |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    if (!Object.hasOwn(urlMap, type)) {
        throw new InvalidParameterError('Invalid type. Use tzgg, zsxx, or pyxx.');
    }
    const response = await got(`https://yjsy.ncepu.edu.cn/${urlMap[type]}/index.htm`);
    const data = response.data; // The list page HTML

    const $ = load(data);
    const list = $('.articleList ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            // The article anchor provides the title and URL.
            const a = $item.find('a');
            // Publication date
            const pubDate = timezone(parseDate($item.find('span').text().replace('[', '').replace(']', '')), 8);
            // Resolve the relative article URL.
            const urlHead = `https://yjsy.ncepu.edu.cn/${urlMap[type]}/`;
            const urlPart = a.attr('href');
            const url = urlHead + urlPart;
            // Return the article fields.
            return {
                title: a.attr('title')!,
                link: url,
                pubDate,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const itemData = await cache.tryGet(item.link, async () => (await got(item.link)).data);
            const content = load(itemData);

            const author = extractAuthor(content('.articleAuthor').text());
            const eDescription = content('.article').html();
            const files = content('.Annex').html() || '';

            const single = {
                title: item.title!,
                link: item.link,
                description: (eDescription || '') + files,
                author,
                pubDate: item.pubDate,
            };
            return single;
        },
        { concurrency: 6 }
    );

    return {
        title: `${titleMap[type]}-华北电力大学研究生院`,
        link: `http://yjsy.ncepu.edu.cn/${urlMap[type]}`,
        description: `华北电力大学研究生院${descriptionMap[type]}`,
        item: items,
    };
}
