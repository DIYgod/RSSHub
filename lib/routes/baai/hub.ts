// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

const { baseUrl, apiHost, parseEventDetail, parseItem } = require('./utils');

export default async (ctx) => {
    const { tagId, sort = 'new', range } = ctx.req.param();

    let title, description, brief, iconUrl;
    if (tagId) {
        const { data } = await got(`${apiHost}/api/v1/tags`, {
            searchParams: {
                id: tagId,
            },
        });
        title = data.data[0].title;
        description = data.data[0].description;
        brief = data.data[0].brief;
        iconUrl = data.data[0].icon_url;
    }

    const responses = await got.all(
        Array.from(
            {
                // first 3 pages
                length: (ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 18) / 6,
            },
            (_, v) => `${apiHost}/api/v1/story/list?page=${v + 1}&sort=${sort}${tagId ? `&tag_id=${tagId}` : ''}${range ? `&time_range=${range}` : ''}`
        ).map((url) => got.post(url))
    );

    const list = responses
        .filter((response) => response.data.data)
        .flatMap((response) => response.data.data)
        .map((item) => parseItem(item));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.eventId) {
                    item.description = await parseEventDetail(item);
                } else {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    item.description = item.is_event ? $('div.box2').html() : $('.post-content').html();
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${title ? `${title} - ` : ''}${description ? `${description} - ` : ''}智源社区`,
        description: brief,
        link: `${baseUrl}/?${tagId ? `tag_id=${tagId}&` : ''}sort=${sort}${range ? `&time_range=${range}` : ''}`,
        image: iconUrl,
        item: items,
    });
};
