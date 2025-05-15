import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, fixImage, fixVideo } from './utils';

export const route: Route = {
    path: '/user/:name',
    categories: ['bbs'],
    example: '/pikabu/user/@bula.dragon',
    parameters: { name: 'User name' },
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
            source: ['pikabu.ru/:name'],
        },
    ],
    name: 'User',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const link = `${baseUrl}/${name}`;
    const response = await got(link, {
        responseType: 'buffer',
    });

    const charset = response.headers['content-type'].match(/charset=([\w-]+)/)[1]; // windows-1251
    const $ = load(iconv.decode(response.data, charset));

    const items = $('.story__main')
        .not('.story__placeholder')
        .toArray()
        .map((story) => {
            story = $(story);

            const a = story.find('.story__title a');
            fixImage(story);
            story.find('.player').each((_, elem) => {
                elem = $(elem);
                fixVideo(elem);
            });
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(story.find('time').attr('datetime')),
                description: story.find('.story__content-inner').html(),
                author: story.find('.user__nick').text(),
            };
        });

    return {
        title: $('meta[property="og:title"]').attr('content'),
        description: $('.profile__user-about-content').text(),
        image: $('meta[property="og:image"]').attr('content'),
        language: 'ru-RU',
        link,
        item: items,
    };
}
