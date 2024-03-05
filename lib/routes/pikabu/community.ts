// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { baseUrl, fixImage, fixVideo } = require('./utils');

export default async (ctx) => {
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

    ctx.set('data', {
        title: response.data.title,
        link: `${baseUrl}/${type}/${name}`,
        language: 'ru-RU',
        item: items,
    });
};
