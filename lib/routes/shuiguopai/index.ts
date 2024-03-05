// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    videos,
                    description: content('.content').html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '水果派',
        link: rootUrl,
        item: items,
    });
};
