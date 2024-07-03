import { Route } from '@/types';

import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/mirrormedia',
    parameters: {},
    name: '首页',
    maintainers: ['dzx-dzx'],
    radar: [
        {
            source: ['mirrormedia.mg'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://www.mirrormedia.mg';

    const response = await ofetch('https://v3-statics.mirrormedia.mg/files/json/post_external01.json');

    const items = [...response.choices.map((e) => ({ __from: 'choices', ...e })), ...response.latest.map((e) => ({ __from: 'latest', ...e }))]
        .map((e) => ({
            title: e.title,
            pubDate: parseDate(e.publishDate),
            category: [...(e.sections ?? []).map((_) => _.name), e.__from],
            link: `${rootUrl}/${e.style === '' ? 'external' : 'story'}/${e.slug}`,
        }))
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20);

    const list = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const content = load(detailResponse);

                item.description = content("div[data-contents='true']").html();

                return item;
            })
        )
    );

    return {
        title: '鏡週刊 Mirror Media',
        link: rootUrl,
        item: list,
    };
}
