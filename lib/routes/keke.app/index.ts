import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fetchDetail, fetchPage, parseListItems } from './utils';

const categories = {
    latest: { name: '最近更新', path: '/rss/index.xml' },
    movie: { name: '电影', path: '/channel/1.html' },
    series: { name: '连续剧', path: '/channel/2.html' },
    anime: { name: '动漫', path: '/channel/3.html' },
    variety: { name: '综艺纪录', path: '/channel/4.html' },
    short: { name: '短剧', path: '/channel/6.html' },
    'hot-movie': { name: '近期热门电影', path: '/' },
    'hot-series': { name: '近期热门剧集', path: '/' },
    'hot-jpkr': { name: '近期热门日韩剧', path: '/' },
    'hot-western': { name: '近期热门欧美剧', path: '/' },
    'hot-hktw': { name: '近期热门港台剧', path: '/' },
    'hot-cn': { name: '近期热播国产剧', path: '/' },
    'hot-anime': { name: '热播动漫', path: '/' },
    'hot-variety': { name: '热播综艺纪录', path: '/' },
};

export const route: Route = {
    path: '/:category?',
    categories: ['multimedia'],
    example: '/keke.app/latest',
    parameters: {
        category: {
            description: '分类，默认为 `latest`',
            default: 'latest',
            options: Object.entries(categories).map(([value, { name }]) => ({ value, label: name })),
        },
    },
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.keke1.app/'],
            target: '/latest',
        },
    ],
    name: '分类',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'latest';
    const { name, path } = categories[category] ?? categories.latest;
    const limit = Number(ctx.req.query('limit') ?? 20);

    const html = await fetchPage(path);
    const $ = load(html, { xml: category === 'latest' });

    let list: Array<{ title?: string; link: string; pubDate?: Date }>;
    if (category === 'latest') {
        list = $('url')
            .toArray()
            .map((el) => ({
                link: $(el).find('loc').text(),
                pubDate: parseDate($(el).find('lastmod').text()),
            }));
    } else {
        const scope = path === '/' ? $('.section-box').filter((_, el) => $(el).find('.section-header-title').text() === name) : $('body');
        list = parseListItems($, scope);
    }

    const items = await Promise.all(
        list.slice(0, limit).map(async (item) => {
            const detail = await fetchDetail(item);
            return {
                ...(detail as DataItem),
                pubDate: item.pubDate,
            };
        })
    );

    return {
        title: `可可影视 - ${name}`,
        link: `${baseUrl}${path === '/rss/index.xml' ? '/' : path}`,
        item: items,
    };
}
