import { load } from 'cheerio';

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
    url: 'zxcs.info',
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
            source: ['zxcs.info/:type'],
            target: '/novel/:type',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { type } = ctx.req.param();

    const baseUrl = `https://www.zxcs.info`;
    const link = `${baseUrl}/${type}`;
    const response = await ofetch(link);
    const $ = load(response);

    const list: DataItem[] = $('div.book-info')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a').first();
            return {
                title: a.text(),
                link: String(a.attr('href')),
                pubDate: parseDate($item.find('.update').text()),
                category: [],
                description: '',
                image: '',
                author: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(String(item.link), async () => {
                const response = await ofetch(String(item.link));
                const $ = load(response);
                const links = String(item.link).split('/');
                item.category = [types[String(links.at(-2))]];
                item.description = String($('.intro').first().html());
                item.image = baseUrl + String($('.book-cover img').attr('src'));
                item.author = $('.author').text();
                return item;
            })
        )
    );

    return {
        title: `知轩藏书 - ${types[type]}`,
        link,
        item: items,
    };
}
