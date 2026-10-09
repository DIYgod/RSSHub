import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, parseContent } from './utils';

export const route: Route = {
    path: '/user/:username',
    categories: ['bbs'],
    example: '/t66y/user/金小妹',
    parameters: { username: '用户名，与源站 /@用户名 页面一致' },
    radar: [{ source: ['t66y.com/@:username', 'www.t66y.com/@:username'], target: '/user/:username' }],
    features: { nsfw: true },
    name: '用户主题',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    const link = `${baseUrl}/@${encodeURIComponent(username)}`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('tr.tr3 h3 a[href]')
        .slice(0, Number(ctx.req.query('limit')) || 20)
        .toArray()
        .map((element) => {
            const anchor = $(element);
            const row = anchor.closest('tr');
            const timestamp = row.find('span[data-timestamp]').attr('data-timestamp')?.replace(/s$/, '');
            return {
                title: anchor.text(),
                link: new URL(anchor.attr('href')!, baseUrl).href,
                author: username,
                category: row.find('td').eq(2).find('a').first().text(),
                ...(timestamp && { pubDate: parseDate(timestamp, 'X') }),
            };
        });
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                return { ...item, description: parseContent(detailResponse.data) };
            }),
        { concurrency: 3 }
    );
    return { title: `${username} - 草榴社区`, link, item: items };
}
