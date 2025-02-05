import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

function getKeysRecursive(dic, key, attr, array) {
    for (const v of Object.values(dic)) {
        if (v[key] === undefined) {
            array.push(v[attr]);
        } else {
            getKeysRecursive(v[key], key, attr, array);
        }
    }
    return array;
}

export const route: Route = {
    path: '/news/:category?',
    categories: ['traditional-media'],
    example: '/huanqiu/news/china',
    parameters: { category: '类别，可以使用二级域名作为参数，默认为：china' },
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
            source: ['huanqiu.com/'],
        },
    ],
    name: '分类',
    maintainers: ['yuxinliu-alex'],
    handler,
    url: 'huanqiu.com/',
    description: `| 国内新闻 | 国际新闻 | 军事 | 台海   | 评论    |
| -------- | -------- | ---- | ------ | ------- |
| china    | world    | mil  | taiwai | opinion |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'china';
    if (!isValidHost(category)) {
        throw new InvalidParameterError('Invalid category');
    }

    const host = `https://${category}.huanqiu.com`;

    const resp = await got({
        method: 'get',
        url: `${host}/api/channel_pc`,
    });

    const name = getKeysRecursive(resp.data.children, 'children', 'domain_name', [])[0];

    const nodes = getKeysRecursive(resp.data.children, 'children', 'node', [])
        .map((x) => `"${x}"`)
        .join(',');
    const req = await got({
        method: 'get',
        url: `${host}/api/list?node=${nodes}&offset=0&limit=${ctx.req.query('limit') ?? 20}`,
    });

    let items = req.data.list
        .filter((item) => item.aid)
        .map((item) => ({
            link: `${host}/article/${item.aid}`,
            title: item.title,
        }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('textarea.article-content').text();
                item.author = content('span', '.source').text();
                item.pubDate = parseDate(Number.parseInt(content('textarea.article-time').text()));
                item.category = content('meta[name="keywords"]').attr('content').split(',');

                return item;
            })
        )
    );

    return {
        title: `${name} - 环球网`,
        link: host,
        description: '环球网',
        language: 'zh-cn',
        item: items,
    };
}
