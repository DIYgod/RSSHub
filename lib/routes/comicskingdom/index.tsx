import { renderToString } from 'hono/jsx/dom/server';

import type { Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:name',
    categories: ['anime'],
    example: '/comicskingdom/pardon-my-planet',
    parameters: { name: 'URL path of the strip on comicskingdom.com' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['comicskingdom.com/:name/*', 'comicskingdom.com/:name'],
        },
    ],
    name: 'Archive',
    maintainers: ['stjohnjohnson'],
    handler,
};

async function handler(ctx) {
    const baseURL = 'https://comicskingdom.com';
    const name = ctx.req.param('name');
    const url = `${baseURL}/${name}/archive`;
    const comics = await ofetch('https://wp.comicskingdom.com/wp-json/wp/v2/ck_comic', {
        query: {
            ck_feature: name,
            per_page: 75,
            page: 1,
            order: 'desc',
        },
    });
    const items = comics
        .filter((comic) => new URL(comic.link).pathname.startsWith(`/${name}/`))
        .map((comic) => ({
            title: comic.title.rendered,
            author: comic.ck_comic_byline.replace(/^By\s+/, ''),
            category: 'comic',
            description: renderToString(<img src={comic.assets.single.url} alt={comic.assets.single.altText} />),
            pubDate: parseDate(`${comic.date_gmt}Z`),
            link: new URL(new URL(comic.link).pathname, baseURL).href,
        }));

    return {
        title: comics[0]?.ck_comic_feature_name || name,
        link: url,
        item: items,
        language: 'en-us' as const satisfies Language,
    };
}
