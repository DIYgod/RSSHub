import { Route, Data } from '@/types';
import { ofetch } from 'ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';

const URL = 'https://wufazhuce.com/';
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
    const response = await ofetch(URL, {
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
    });
    // 从 html 响应中提取相关信息
    const $ = load(response);
    const photography_items = $('#carousel-one div.item')
        .toArray()
        .map((item) => {
            const a = $(item).find('.fp-one-cita a').first();
            return {
                title: `[摄影]${a.text()}`,
                link: String(a.attr('href')),
                description: '',
            };
        });
    const article_item = $('.fp-one-articulo a')
        .toArray()
        .map((item) => {
            const a = $(item);
            return {
                title: `[ONE 文章]${a.text()}`,
                link: String(a.attr('href')),
                description: '',
            };
        });
    const question_item = $('.fp-one-cuestion a')
        .toArray()
        .map((item) => {
            const a = $(item);
            return {
                title: `[ONE 问题]${a.text()}`,
                link: String(a.attr('href')),
                description: '',
            };
        });
    const list = [...photography_items, ...article_item, ...question_item];
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('#main-container').html() || '';
                return item;
            })
        )
    );

    // 生成rss
    return {
        title: '「ONE · 一个」',
        link: URL,
        item: items,
        description: '复杂世界里, 一个就够了. One is all.',
    };
}
