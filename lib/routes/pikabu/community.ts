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
    const { name } = ctx.req.param();
    const type = getSubPath(ctx).split('/', 2)[1];
    const { data: response } = await got(`${baseUrl}/ajax/${type}/${name}`);

    const items = response.data.stories.flatMap((story) => {
        const $ = load(story.html, null, false);
        const content = $('.story__main');
        const title = content.find('.story__title a');
        const link = title.attr('href');
        if (!link) {
            return [];
        }
        const date = content.find('time').attr('datetime');

        fixImage(content);
        content.find('.player').each((_, elem) => {
            const $elem = $(elem);
            fixVideo($elem);
        });
        return {
            title: title.text(),
            description: content.find('.story__content-inner').html(),
            pubDate: date ? parseDate(date) : undefined,
            author: $('article').attr('data-author-name'),
            category: content
                .find('.tags__tag[data-tag]')
                .toArray()
                .map((tag) => $(tag).attr('data-tag'))
                .filter((tag): tag is string => Boolean(tag)),
            link: new URL(link, baseUrl).href,
        };
    });

    return {
        title: response.data.title,
        link: `${baseUrl}/${type}/${name}`,
        language: 'ru-ru' as const,
        item: items,
    };
}
