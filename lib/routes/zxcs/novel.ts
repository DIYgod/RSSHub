import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const types = {
    jinqigengxin: '近期更新',
    dushi: '都市',
    xianxia: '仙侠',
    xuanhuan: '玄幻',
    qihuan: '奇幻',
    lishi: '历史',
    youxi: '游戏',
    wuxia: '武侠',
    kehuan: '科幻',
    tiyu: '体育',
    lingyi: '灵异',
    junshi: '军事',
    erciyuan: '轻小说',
};

export const route: Route = {
    path: '/novel/:type',
    name: '小说列表',
    url: 'zxcs.click',
    maintainers: ['liaochuan'],
    example: '/zxcs/novel/jinqigengxin',
    parameters: { type: '小说类型, 可在对应类型页 URL 中找到' },
    description: `支持小说类型：${Object.entries(types)
        .map(([key, value]) => `${key}-${value}`)
        .join(',')}`,
    categories: ['reading'],
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
            source: ['zxcs.click/:type'],
            target: '/novel/:type',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { type } = ctx.req.param();
    if (!Object.hasOwn(types, type)) {
        throw new InvalidParameterError('Unsupported novel type. Use a type listed in the route description.');
    }

    const baseUrl = 'https://www.zxcs.click';
    const link = `${baseUrl}/${type}`;
    const response = await ofetch(link);
    const $ = load(response);

    const list: DataItem[] = $('div.book-info')
        .toArray()
        .flatMap((item): DataItem[] => {
            const $item = $(item);
            const a = $item.find('a').first();
            const href = a.attr('href');
            if (!href) {
                return [];
            }
            return [
                {
                    title: a.text(),
                    link: new URL(href, link).href,
                    pubDate: getPublicationDate($item.find('.update').text()),
                    category: [],
                    description: '',
                    image: '',
                    author: '',
                },
            ];
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(String(item.link), async () => {
                const response = await ofetch(String(item.link));
                const $ = load(response);
                const links = String(item.link).split('/');
                const imageUrl = $('.book-cover img').attr('src');
                const category = [
                    ...new Set([
                        types[String(links.at(-2))],
                        ...$('.book-info__categories .category')
                            .toArray()
                            .map((tag) => $(tag).text()),
                    ]),
                ].filter((tag) => typeof tag === 'string' && tag.length > 0);
                return {
                    category,
                    description: $('.intro-content').html() ?? undefined,
                    image: imageUrl ? new URL(imageUrl, String(item.link)).href : undefined,
                    author: $('.author').text(),
                };
            });
            return { ...item, description: detail.description, category: detail.category, image: detail.image, author: detail.author };
        },
        { concurrency: 3 }
    );

    return {
        title: `知轩藏书 - ${types[type]}`,
        link,
        item: items,
    };
}

function getPublicationDate(value: string) {
    if (!value.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
