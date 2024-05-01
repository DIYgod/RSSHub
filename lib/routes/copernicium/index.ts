import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category',
    categories: ['new-media'],
    radar: [{ source: ['www.copernicium.tw'] }],
    name: '分类',
    example: '/copernicium/环球视角',
    parameters: { category: '分类名' },
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const CATEGORY_TO_ARG_MAP = new Map([
        ['环球视角', '4_1'],
        ['人文叙述', '4_3'],
        ['观点评论', '4_5'],
        ['专题报道', '4_7'],
    ]);
    if (!CATEGORY_TO_ARG_MAP.get(ctx.req.param().category)) {
        throw new Error('The requested category does not exist or is not supported.');
    }
    const reqArgs = {
        args: {
            _jcp: CATEGORY_TO_ARG_MAP.get(ctx.req.param().category),
            m31pageno: 1,
        },
        type: 0,
    };
    const res = await ofetch(`https://www.copernicium.tw/nr.jsp`, {
        query: { _reqArgs: reqArgs },
    });
    const $ = load(res);
    const list = $('.J_newsResultLine a.mixNewsStyleTitle')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.text(),
                link: e.attr('href'),
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);
                return {
                    pubDate: parseDate(content('span.newsInfo').text().substring(5)),
                    description: content('.richContent').html(),
                    ...item,
                };
            })
        )
    );
    return {
        title: `日新说 - ${ctx.req.param().category}`,
        link: 'https://www.copernicium.tw',
        item: items,
    };
}
