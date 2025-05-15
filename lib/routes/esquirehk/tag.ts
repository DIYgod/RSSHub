import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { destr } from 'destr';

const topics = new Set(['style', 'watches', 'lifestyle', 'health', 'money-investment', 'gear', 'people', 'watch', 'mens-talk']);

const handler = async (ctx) => {
    let { id = 'Fashion' } = ctx.req.param();

    id = id.toLowerCase();

    const rootUrl = 'https://www.esquirehk.com';

    let currentUrl = `${rootUrl}/tag/${id}`;
    if (topics.has(id)) {
        currentUrl = `${rootUrl}/${id}`;
    }

    const response = await ofetch(currentUrl);

    const $ = cheerio.load(response);
    const list = [
        ...$('div[class^="max-w-[100%]"] > div > div:nth-child(2) > a')
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.text().trim(),
                    link: new URL(item.attr('href'), currentUrl).href,
                };
            }),
        ...$('div.list-item > div > div:nth-child(2) > a')
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.text().trim(),
                    link: new URL(item.attr('href'), currentUrl).href,
                };
            }),
    ]
        .map((item) => ({
            ...item,
            slug: item.link.replace(rootUrl, ''),
        }))
        .filter((item) => !item.slug.startsWith('/campaign'));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const resp = await ofetch(`https://api.esquirehk.com${item.slug}`);
                const response = destr(resp) as any;
                if (response.status === '404') {
                    return item;
                }

                item.description =
                    response.intro.raw +
                    art(path.join(__dirname, 'templates/subpages.art'), {
                        subpages: response.subpages,
                    });
                item.pubDate = parseDate(response.date.published, 'X');
                item.updated = parseDate(response.date.lastModified, 'X');
                item.author = response.author.name;
                item.category = [...response.tags.topic.map((tag) => tag.name), ...response.tags.normal.map((tag) => tag.name)];

                return item;
            })
        )
    );

    return {
        title: `${$('head title').text()} - Esquirehk`,
        description: $('head meta[name="description"]').attr('content'),
        image: $('head meta[property="og:image"]').attr('content'),
        logo: $('head meta[property="og:image"]').attr('content'),
        link: currentUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/tag/:id?',
    categories: ['new-media'],
    example: '/esquirehk/tag/Fashion',
    parameters: { id: '标签，可在对应标签页 URL 中找到' },
    name: 'Tag',
    maintainers: ['nczitzk'],
    radar: [
        {
            source: ['www.esquirehk.com/tag/:id', 'www.esquirehk.com/:id'],
        },
    ],
    handler,
};
