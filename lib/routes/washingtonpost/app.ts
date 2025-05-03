import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { FetchError } from 'ofetch';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';

export const route: Route = {
    path: '/app/:category{.+}?',
    categories: ['traditional-media'],
    example: '/washingtonpost/app/national',
    parameters: {
        category: 'Category from the path of the URL of the corresponding site, see below',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'App',
    maintainers: ['quiniapiezoelectricity'],
    radar: [
        {
            source: ['www.washingtonpost.com/:category'],
            target: '/app/:category',
        },
    ],
    handler,
    description: `::: tip
For example, the category for https://www.washingtonpost.com/national/investigations would be /national/investigations.
:::`,
};

function handleDuplicates(array) {
    const objects = {};
    for (const obj of array) {
        objects[obj.id] = objects[obj.id] ? Object.assign(objects[obj.id], obj) : obj;
    }
    return Object.values(objects);
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const headers = {
        Accept: '*/*',
        Connection: 'keep-alive',
        'User-Agent': 'Classic/6.70.0',
    };
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(advancedFormat);
    art.defaults.imports.dayjs = dayjs;

    const url = `https://jsonapp1.washingtonpost.com/fusion_prod/v2/${category}`;
    const response = await got.get(url, { headers });
    const title = response.data.tracking.page_title.includes('Washington Post') ? response.data.tracking.page_title : `The Washington Post - ${response.data.tracking.page_title}`;
    const link = 'https://washingtonpost.com' + response.data.tracking.page_path;
    const mains = response.data.regions[0].items.filter((item) => item.items);
    const list = mains.flatMap((main) =>
        main.items[0].items
            .filter((item) => item.is_from_feed === true)
            .map((item) => {
                const object = {
                    id: item.id,
                    title: item.headline.text,
                    link: item.link.url,
                    pubDate: item.link.display_date,
                    updated: item.link.last_modified,
                };
                if (item.blurbs?.items[0]?.text) {
                    object.description = item.blurbs?.items[0]?.text;
                }
                return object;
            })
    );
    const feed = handleDuplicates(list);
    const items = await Promise.all(
        feed.map((item) =>
            cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(`https://rainbowapi-a.wpdigital.net/rainbow-data-service/rainbow/content-by-url.json?followLinks=false&url=${item.link}`, { headers });
                } catch (error) {
                    if (error instanceof FetchError && error.statusCode === 415) {
                        // Interactive or podcast contents will return 415 Unsupported Media Type. Keep calm and carry on.
                        return item;
                    } else {
                        throw error;
                    }
                }
                item.title = response.data.title ?? item.title;
                item.author =
                    response.data.items
                        .filter((entry) => entry.type === 'byline')
                        ?.flatMap((entry) => entry.authors.map((author) => author.name))
                        ?.join(', ') ?? '';
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    content: response.data.items,
                });
                return item;
            })
        )
    );

    return {
        title,
        link,
        item: items,
    };
}
