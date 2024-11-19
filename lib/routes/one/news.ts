import { Route, Data, DataItem } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';

const apiUrl = 'https://wufazhuce.com/';
const NAME = '「ONE · 一个」';

export const route: Route = {
    path: `/news`,
    categories: ['reading'],
    example: '/one/news',
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
            source: ['wufazhuce.com'],
            target: '/news',
        },
    ],
    name: NAME,
    maintainers: ['sicheng1806'],
    handler,
};

async function handler(): Promise<Data> {
    const resp = await got(apiUrl);
    const $ = load(resp.body);
    let items: DataItem[] = [];
    items = items.concat(
        ...$('#carousel-one div.item')
            .toArray()
            .map((item) => {
                const a = $(item).find('.fp-one-cita a').first();
                return {
                    title: `[摄影]${a.text()}`,
                    link: String(a.attr('href')),
                    description: '',
                };
            })
    );
    items = items.concat(
        ...$('.fp-one-articulo a')
            .toArray()
            .map((item) => {
                const a = $(item);
                return {
                    title: `[ONE 文章]${a.text()}`,
                    link: String(a.attr('href')),
                    description: '',
                };
            })
    );
    items = items.concat(
        ...$('.fp-one-cuestion a')
            .toArray()
            .map((item) => {
                const a = $(item);
                return {
                    title: `[ONE 问题]${a.text()}`,
                    link: String(a.attr('href')),
                    description: '',
                };
            })
    );
    // 添加全文
    items = await Promise.all(
        items.map((item: DataItem) =>
            cache.tryGet(item.link, async () => {
                const rsp = await got(item.link);
                const content = load(rsp.body);
                item.description = content('#main-container').html() || '';
                return item;
            })
        )
    );

    // 生成rss
    return {
        title: '「ONE · 一个」',
        link: apiUrl,
        item: items,
        description: '复杂世界里, 一个就够了. One is all.',
    };
}
