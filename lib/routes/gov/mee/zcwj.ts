import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const categories = {
    zyygwj: '中央有关文件',
    gwywj: '国务院有关文件',
    bwj: '部文件',
    bgtwj: '办公厅文件',
    xzspwj: '行政审批文件',
    haqjwj: '核安全局文件',
    qt: '其他',
};

export const route: Route = {
    path: '/zcwj/:category?',
    categories: ['government'],
    example: '/gov/mee/zcwj',
    parameters: { category: '栏目路径：zyygwj、gwywj、bwj、bgtwj、xzspwj、haqjwj 或 qt，默认合并政策文件首页的各栏目' },
    radar: [{ source: ['www.mee.gov.cn/zcwj/:category?'], target: '/zcwj/:category?' }],
    name: '政策文件',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    if (category && !Object.hasOwn(categories, category)) {
        throw new InvalidParameterError(`Unknown policy category: ${category}. Use ${Object.keys(categories).join(', ')}.`);
    }
    const link = `https://www.mee.gov.cn/zcwj/${category ? `${category}/` : ''}`;
    const response = await ofetch(link);
    const $ = load(response);
    const seen = new Set<string>();
    const list = $('li:has(.date)')
        .toArray()
        .flatMap((element): DataItem[] => {
            const row = $(element);
            const anchor = row.find('a[href]').first();
            const href = anchor.attr('href');
            if (!href) {
                return [];
            }
            const itemLink = new URL(href, link).href;
            if (seen.has(itemLink)) {
                return [];
            }
            seen.add(itemLink);
            return [{ title: anchor.text(), link: itemLink, pubDate: timezone(parseDate(row.find('.date').text()), 8) }];
        })
        .toSorted((a, b) => new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime())
        .slice(0, Number(ctx.req.query('limit')) || 20);
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                const date = content('meta[name="PubDate"]').attr('content');
                return {
                    ...item,
                    ...(date && { pubDate: timezone(parseDate(date), 8) }),
                    description: content('.TRS_Editor').html() || content('.content_body_box').html() || content('.neiright_JPZ_GK_CP').html(),
                };
            }),
        { concurrency: 3 }
    );
    return { title: `${category ? categories[category] : '政策文件'} - 中华人民共和国生态环境部`, link, language: 'zh-CN' as const, item: items };
}
