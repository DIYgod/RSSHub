import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['shuiguopai.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
    url: 'shuiguopai.com/',
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const rootUrl = 'https://sgptv.vip';
    const apiRootUrl = 'https://api.cbbee0.com';
    const listUrl = `${apiRootUrl}/v1_2/homePage`;
    const filmUrl = `${apiRootUrl}/v1_2/filmInfo`;

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const response = await got({
        method: 'post',
        url: listUrl,
        json: {
            device_id: '',
            hm: '008-api',
            last_page: 0,
            length: limit,
            ltype: 1,
            page: 1,
            userToken: '',
        },
    });

    let items = response.data.data.list.map((item) => ({
        title: item.title,
        guid: item.library_id,
        link: `${rootUrl}/play-details/${item.library_id}`,
        pubDate: timezone(parseDate(item.show_time_origin, 'YYYY-MM-DD HH:mm:ss'), +8),
        category: item.tags.map((t) => t.tag_title),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                content('iframe').remove();

                let videos;
                const filmId = detailResponse.data.match(/film_id:"([\d,]+)",/)?.[1];
                if (filmId) {
                    const infoResponse = await got({
                        method: 'post',
                        url: filmUrl,
                        json: {
                            device_id: '',
                            film_id: filmId,
                            hm: '008-api',
                            userToken: '',
                        },
                    });

                    const data = infoResponse.data.data;

                    videos = data.map((d) => d.download_url);

                    item.category = data.flatMap((d) => d.tags.map((t) => t.tag_title));
                    item.author = data.map((d) => d.actor).join(' ');
                }

                item.description = renderToString(
                    <>
                        {videos?.map((video) => (
                            <video controls>
                                <source src={video} type="video/mp4" />
                            </video>
                        ))}
                        {raw(content('.content').html())}
                    </>
                );

                return item;
            })
        )
    );

    return {
        title: '水果派',
        link: rootUrl,
        item: items,
    };
}
