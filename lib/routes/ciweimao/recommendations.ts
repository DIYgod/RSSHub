import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const sections = { recommended: { index: 0, name: '重磅推荐' }, hot: { index: 1, name: '最热连载小说' }, featured: { index: 3, name: '精选强推' } };

export const route: Route = {
    path: '/recommendations/:section?',
    example: '/ciweimao/recommendations/hot',
    parameters: { section: '首页栏目：recommended（重磅推荐）、hot（最热连载小说）、featured（精选强推），默认 recommended' },
    categories: ['reading'],
    name: '小说推荐',
    maintainers: ['DIYgod'],
    radar: [{ source: ['wap.ciweimao.com/'], target: '/recommendations' }],
    handler,
};

async function handler(ctx) {
    const section = ctx.req.param('section') || 'recommended';
    if (!Object.hasOwn(sections, section)) {
        throw new InvalidParameterError('Use recommended, hot or featured as the recommendation section.');
    }
    const link = 'https://wap.ciweimao.com/';
    const response = await ofetch(link);
    const $ = load(response);
    const seen = new Set<string>();
    const list = $('.cnt-box')
        .eq(sections[section].index)
        .find('a[href*="/book/"]')
        .toArray()
        .map((element) => $(element).attr('href')!)
        .filter((url) => {
            if (seen.has(url)) {
                return false;
            }
            seen.add(url);
            return true;
        })
        .slice(0, Number(ctx.req.query('limit')) || 20);
    const items = await pMap(
        list,
        (itemLink) =>
            cache.tryGet(itemLink, async () => {
                const detailResponse = await ofetch(itemLink);
                const content = load(detailResponse);
                const author = content('meta[property="og:novel:author"]').attr('content');
                const cover = content('meta[name="image"]').attr('content');
                return {
                    title: content('.book-name').text(),
                    link: itemLink,
                    author,
                    category: content('meta[property="og:novel:category"]').attr('content'),
                    description: `${cover ? `<img src="${cover}" />` : ''}${content('.book-desc').html() || ''}`,
                };
            }),
        { concurrency: 3 }
    );
    return { title: `${sections[section].name} - 刺猬猫`, link, item: items };
}
