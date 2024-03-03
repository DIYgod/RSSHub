// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const rootUrl = 'https://anitaku.to/home.html';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);
    const recentReleases = $('.last_episodes');
    const listItems = $(recentReleases).find('li');

    const arrayOfItems = listItems.toArray().map((item) => {
        const title = $(item).find('.name a').attr('title');
        const episode = $(item).find('.episode').text();
        const link = $(item).find('.name a').attr('href');
        const img = $(item).find('.img a img').attr('src');

        const formattedDescription = `<h2>${episode}</h2><br/><img src='${img}' alt='${title}'>`;

        const structuredData = {
            title,
            description: formattedDescription,
            link,
        };
        return structuredData;
    });

    ctx.set('data', {
        title: $('title').text(),
        link: rootUrl,
        item: arrayOfItems,
    });
};
