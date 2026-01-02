import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseItems } from './utils';

export const route: Route = {
    path: '/actress/:id',
    name: 'Actress',
    maintainers: ['huanfe1'],
    example: '/javtiful/actress/akari-tsumugi',
    parameters: { id: 'Actress name' },
    handler,
    categories: ['multimedia'],
    radar: [
        {
            source: ['javtiful.com/actress/:id', 'javtiful.com/actress/:id/*'],
            target: '/actress/:id',
        },
    ],
    features: {
        nsfw: true,
    },
};

async function handler(ctx): Promise<Data> {
    const { id } = ctx.req.param();
    const html = await ofetch(`https://javtiful.com/actress/${id}`);
    const $ = load(html as string);
    const items: DataItem[] = $('section .card:not(:has(.bg-danger))')
        .toArray()
        .map((item) => parseItems($(item)));
    return {
        title: $('.channel-item__name_details a').text(),
        link: `https://javtiful.com/actress/${id}`,
        allowEmpty: true,
        item: items,
        image: $('.content-section-title img').attr('src'),
        language: $('html').attr('lang'),
    };
}
