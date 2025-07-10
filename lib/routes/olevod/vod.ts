import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/vod/:id',
    categories: ['multimedia'],
    example: '/olevod/vod/202449091',
    parameters: { id: '视频id号' },
    radar: [
        {
            source: ['www.olevod.one/vod/:id'],
            target: '/vod/:id',
        },
    ],
    name: '视频',
    maintainers: ['fang63625'],
    handler,
};

async function handler(ctx) {
    const urlBase = 'https://www.olevod.one';
    const id = ctx.req.param('id');
    const url = `${urlBase}/vod/${id}`;

    const response = await ofetch(url);
    const $ = load(response);

    const title = $('.title.scookie').text().trim();
    const image = $('.vodlist_thumb.lazyload').attr('data-original');
    const items = $('.content_playlist.clearfix a')
        .toArray()
        .map((item) => {
            const tmp = $(item);
            const href = urlBase + tmp.attr('href');

            return {
                title: `${title}  ${tmp.text()}`,
                link: href,
            };
        });

    return {
        title,
        link: url,
        item: items,
        image: urlBase + image,
    };
}
