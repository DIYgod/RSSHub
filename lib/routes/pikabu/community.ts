import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fixImage, fixVideo } from './utils';

export const route: Route = {
    path: '/:type/:name',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { type, name, sort = 'new' } = ctx.req.param();
    const sortString = sort === 'default' || type === 'tag' ? '' : `/${sort}`;
    const { data: response } = await got(`${baseUrl}/ajax/${type}/${name}${sortString}`);

    const items = response.data.stories.map((story) => {
        const $ = load(story.html, null, false);
        const data = JSON.parse($('script[type="application/ld+json"]').text());

        const content = $('.story__main');

        fixImage(content);
        content.find('.player').each((_, elem) => {
            elem = $(elem);
            fixVideo(elem);
        });
        return {
            title: data.name,
            description: content.find('.story__content-inner').html(),
            pubDate: parseDate(data.dateCreated),
            author: data.author.name,
            link: data.url,
        };
    });

    return {
        title: response.data.title,
        link: `${baseUrl}/${type}/${name}`,
        language: 'ru-RU',
        item: items,
    };
}
