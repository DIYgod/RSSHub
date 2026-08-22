import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const categories = {
    astrology: '星相',
    canada: '加国',
    children: '育儿',
    china: '大陆',
    chinese: '华人',
    edu: '教育',
    ent: '娱乐',
    fashion: '时尚',
    finance: '财经',
    food: '美食',
    funny: '搞笑',
    health: '养生',
    history: '历史',
    hk_macau: '港澳',
    immigration: '移民',
    in: '国际',
    it: '科技',
    love: '情感',
    mil: '军事',
    misc: '杂闻',
    pet: '宠物',
    photo: '摄影',
    politics: '政坛',
    sport: '体育',
    stock_us: '美股',
    taiwan: '台湾',
    travel: '旅游',
    usa: '美国',
};

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/kuai/stock_us',
    parameters: {
        category: {
            description: '栏目，留空为首页',
            options: Object.entries(categories).map(([value, label]) => ({ value, label })),
        },
    },
    radar: [
        {
            source: ['www.kuai.media/news/:category/'],
            target: '/:category',
        },
    ],
    name: '首页更新 / 具体栏目更新',
    maintainers: ['salviox'],
    handler,
    url: 'www.kuai.media',
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();
    const baseUrl = 'https://www.kuai.media';
    const link = category ? `${baseUrl}/news/${category}/` : baseUrl;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.data_row')
        .slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 40)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('.news_title h3 a');
            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);
                content('.s .more').remove();
                item.pubDate = timezone(parseDate(content('.xg1.hm').contents().first().text().trim(), 'YYYY-M-D HH:mm'), 8);
                item.description = (content('.s a').html()?.trim() ?? '') + (content('.video').html() ?? '');
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
