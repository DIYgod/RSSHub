import { load } from 'cheerio';

import type { Data, DataItem, Language, Route } from '@/types';
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
    const html = await ofetch<string>(`https://javtiful.com/actress/${id}`);
    const $ = load(html);
    const items: DataItem[] = $('article.video-card:not(.video-card--partner)')
        .toArray()
        .map((item) => parseItems($(item), `https://javtiful.com/actress/${id}`));
    return {
        title: $('.profile-summary__copy h2').text(),
        link: `https://javtiful.com/actress/${id}`,
        item: items,
        image: $('.profile-avatar img').attr('src'),
        language: $('html').attr('lang') as Language,
    };
}
