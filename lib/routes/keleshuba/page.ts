import type { Data, Route } from '@/types';
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';

const baseUrl = 'www.keleshuba.net';

export const route: Route = {
    path: '/book/:bookId',
    example: '/keleshuba/book/262562',
    parameters: { bookId: '小说 ID，可在 URL 中找到' },
    maintainers: ['Ritsuka314'],
    name: '小说更新',
    handler,
    radar: [
        { source: [`${baseUrl}/book/:bookId`], },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { bookId } = ctx.req.param();
    const link = `https://${baseUrl}/book/${bookId}`;

    const response = await ofetch(link);
    const $ = cheerio.load(response);

    const title = $('.cover h2').text();
    const cover = $('.block_img2 img').attr('src');
    const description = $('.intro_info').text();

    const items = $('#allChapters2 a')
        .toArray()
        .map((item_) => {
            const item = $(item_);

            return {
                title: item.text(),
                link: `${link}/${item.attr('href')}`,
            };
        });

    return {
        title,
        description,
        link,
        language: 'zh-CN',
        image: `${baseUrl}${cover}`,
        item: items
    };
}
