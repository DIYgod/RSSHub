import { load } from 'cheerio';

import type { Data, DataItem, Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseItems } from './utils';

export const route: Route = {
    path: '/channel/:id',
    name: 'Channel',
    maintainers: ['huanfe1'],
    example: '/javtiful/channel/madonna',
    parameters: { id: 'Channel name' },
    handler,
    categories: ['multimedia'],
    radar: [
        {
            source: ['javtiful.com/channel/:id', 'javtiful.com/channel/:id/*'],
            target: '/channel/:id',
        },
    ],
    features: {
        nsfw: true,
    },
};

async function handler(ctx): Promise<Data> {
    const { id } = ctx.req.param();
    const html = await ofetch<string>(`https://javtiful.com/channel/${id}`);
    const $ = load(html);
    const items: DataItem[] = $('article.video-card:not(.video-card--partner)')
        .toArray()
        .map((item) => parseItems($(item), `https://javtiful.com/channel/${id}`));
    return {
        title: $('.profile-summary__copy h2').text(),
        link: `https://javtiful.com/channel/${id}`,
        item: items,
        image: $('.profile-avatar img').attr('src'),
        language: $('html').attr('lang') as Language,
    };
}
