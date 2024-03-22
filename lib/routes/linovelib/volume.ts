import type { Route, Data } from '@/types';
import type { Context } from 'hono';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/volume/:id',
    categories: ['reading'],
    example: '/linovelib/volume/8',
    parameters: { id: '小说 ID，可在小说页 URL 中找到' },
    radar: [
        {
            source: ['www.linovelib.com/novel/:id/catalog'],
        },
    ],
    name: '卷',
    maintainers: ['rkscv'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { id } = ctx.req.param();
    const link = `https://www.linovelib.com/novel/${id}/catalog`;
    const $ = load(await got(link).text());
    return {
        title: `${$('.book-meta h1').text()} - 哔哩轻小说`,
        link,
        item: $('.volume')
            .toArray()
            .map((elem) => ({
                title: $(elem).find('h2').text(),
                link: $(elem).find('.volume-cover').attr('href'),
            }))
            .toReversed(),
    };
}
