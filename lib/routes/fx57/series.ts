import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

const baseUrl = 'http://www.fx57.cn';

export const route: Route = {
    path: '/series/:path{.+}',
    example: '/fx57/series/fx57/film/animation/2020-10-18/346.html',
    name: '剧集下载更新',
    categories: ['multimedia'],
    maintainers: ['DIYgod'],
    features: { supportBT: true },
    parameters: { path: '剧集详情 URL 中的完整路径，例如 fx57/film/animation/2020-10-18/346.html。' },
    description: 'Each unique magnetic link is a separate item with a BitTorrent enclosure. Subscribe to a specific series page; use common RSSHub filters to select release names or resolutions.',
    radar: [{ source: ['fx57.cn/fx57/:section/:path*', 'www.fx57.cn/fx57/:section/:path*'], target: '/series/fx57/:section/:path*' }],
    handler,
};

async function handler(ctx) {
    const path = ctx.req.param('path');
    if (!/^fx57\/[\w/-]+\.html$/.test(path) || path.includes('..')) {
        throw new InvalidParameterError('Provide a series detail path beginning with fx57/ and ending in .html.');
    }
    const link = `${baseUrl}/${path}`;
    const response = await ofetch(link);
    const $ = load(response);
    const name = $('h1').text();
    const seen = new Set<string>();
    const groups: DataItem[][] = [[]];
    for (const element of $('.con_text ul > li').toArray()) {
        const row = $(element);
        const anchor = row.find('a[href^="magnet:?xt=urn:btih:"]').first();
        if (!anchor.length) {
            if (row.text().trim()) {
                groups.push([]);
            }
            continue;
        }
        const magnet = anchor.attr('href')!;
        const hash = magnet.match(/urn:btih:([a-zA-Z0-9]+)/)![1].toLowerCase();
        if (seen.has(hash)) {
            continue;
        }
        seen.add(hash);
        groups.at(-1)!.push({
            title: anchor.text() || name,
            link: `${link}#${hash}`,
            guid: hash,
            description: `<a href="${magnet}">${anchor.html() || name}</a>`,
            enclosure_url: magnet,
            enclosure_type: 'application/x-bittorrent',
        });
    }
    const items = groups.flatMap((group) => group.toReversed()).slice(0, Number(ctx.req.query('limit')) || 20);
    return { title: `枫叶网 - ${name}`, link, language: 'zh-CN' as const, item: items };
}
