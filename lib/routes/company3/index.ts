import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:category?',
    categories: ['design'],
    example: '/company3/features',
    parameters: {
        category: {
            description: 'Category',
            options: ['commercials', 'features', 'television', 'sound'].map((c) => ({ value: c, label: c })),
            default: 'commercials',
        },
    },
    radar: [
        {
            source: ['www.company3.com/video-categories/:category'],
            target: '/:category',
        },
    ],
    name: 'Video Categories',
    maintainers: ['MisteryMonster'],
    handler,
    url: 'www.company3.com',
};

async function handler(ctx: Context): Promise<Data> {
    const { category = 'commercials' } = ctx.req.param();
    const baseUrl = 'https://www.company3.com';
    const link = `${baseUrl}/video-categories/${category}/`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('div.preview.video div.details a')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20)
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.find('h4.title').text(),
                link: $item.attr('href')!,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch(item.link);
                const $ = load(detail);
                const article = $('article');
                article.find('.social.share').remove();

                const iframeSrc = article.find('iframe').attr('src');
                item.author = article.find('.entry-header .subtitle').text();
                item.description = (iframeSrc ? `<iframe src="${iframeSrc}" allowfullscreen></iframe>` : '') + article.find('.entry-content').html();
                return item;
            })
        )
    );

    return {
        title: `Company 3 | ${category}`,
        link,
        language: 'en',
        item: items,
    };
}
