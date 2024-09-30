import { Route, Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseItems } from './utils';

export const route: Route = {
    path: '/channel/:id',
    name: 'Channel',
    maintainers: ['huanfe1'],
    example: '/javtiful/channel/madonna',
    parameters: { id: 'Actress name' },
    handler,
    categories: ['multimedia'],
};

async function handler(ctx): Promise<Data> {
    const { id } = ctx.req.param();
    const html = await ofetch(`https://javtiful.com/channel/${id}`, {
        method: 'get',
        headers: {
            'Accept-Language': 'zh-CN,zh;q=0.9',
        },
    });

    const $ = load(<string>html);
    const items: DataItem[] = $('section .card:not(:has(.bg-danger))')
        .toArray()
        .map((item) => parseItems($(item)));
    return {
        title: $('.channel-item__name_details a').text(),
        link: `https://javtiful.com/channel/${id}`,
        allowEmpty: true,
        item: items,
        image: $('.content-section-title img').attr('src'),
        language: $('html').attr('lang'),
    };
}
