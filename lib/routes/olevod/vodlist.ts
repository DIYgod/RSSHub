import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/vodlist',
    categories: ['multimedia'],
    example: '/olevod/vodlist',
    radar: [
        {
            source: ['www.olevod.one'],
            target: '/vodlist',
        },
    ],
    name: '最新视频',
    maintainers: ['fang63625'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler() {
    const urlBase = 'https://www.olevod.one';
    const title = '欧乐影院 最新视频';

    const response = await ofetch(urlBase);
    const $ = load(response);

    const items = $('.cbox1 .vodlist_thumb.lazyload')
        .toArray()
        .map((item) => {
            const tmp = $(item);
            const href = urlBase + tmp.attr('href');
            const title = tmp.attr('title');
            const image = urlBase + tmp.attr('data-original');

            return {
                title: `${title} ${tmp.find('.pic_text.text_right').text()}`,
                link: href,
                image,
                description: `豆瓣评分 ${tmp.find('.text_right.text_dy').text()}`,
            };
        });

    return {
        title,
        link: urlBase,
        item: items,
    };
}
