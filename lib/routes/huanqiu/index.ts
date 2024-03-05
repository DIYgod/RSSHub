// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

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

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'china';
    if (!isValidHost(category)) {
        throw new Error('Invalid category');
    }

    const host = `https://${category}.huanqiu.com`;

    const resp = await got({
        method: 'get',
        url: `${host}/api/channel_pc`,
    }).json();
    const name = getKeysRecursive(resp.children, 'children', 'domain_name', [])[0];

    const nodes = getKeysRecursive(resp.children, 'children', 'node', [])
        .map((x) => `"${x}"`)
        .join(',');
    const req = await got({
        method: 'get',
        url: `${host}/api/list?node=${nodes}&offset=0&limit=${ctx.req.query('limit') ?? 20}`,
    }).json();

    let items = req.list
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

    ctx.set('data', {
        title: `${name} - 环球网`,
        link: host,
        description: '环球网',
        language: 'zh-cn',
        item: items,
    });
};
