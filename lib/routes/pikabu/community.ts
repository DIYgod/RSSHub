import { load } from 'cheerio';

import type { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fixImage, fixVideo } from './utils';

export const route: Route = {
    path: '/community/:name',
    categories: ['bbs'],
    example: '/pikabu/community/real_true_story',
    parameters: { name: 'Community name' },
    radar: [
        {
            source: ['pikabu.ru/community/:name'],
            target: '/community/:name',
        },
    ],
    name: 'Community',
    maintainers: ['TonyRL'],
    handler,
};

export async function handler(ctx) {
    const { name, sort = 'new' } = ctx.req.param();
    const type = getSubPath(ctx).split('/', 2)[1];
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
