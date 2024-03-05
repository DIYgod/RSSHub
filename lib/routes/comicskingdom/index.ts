// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const baseURL = 'https://comicskingdom.com';
    const name = ctx.req.param('name');
    const url = `${baseURL}/${name}/archive`;
    const { data } = await got(url);

    const $ = load(data);

    // Determine Comic and Author from main page
    const comic = $('title').text().replace('Comics Kingdom - ', '').trim();
    const author = $('.feature-title h2').text();

    // Find the links for all non-archived items
    const links = $('div.tile')
        .toArray()
        .map((el) => $(el).find('a').first().attr('href'));

    if (links.length === 0) {
        throw new Error(`Comic Not Found - ${name}`);
    }
    const items = await Promise.all(
        links.map((link) =>
            cache.tryGet(link, async () => {
                const detailResponse = await got(link);
                const content = load(detailResponse.data);

                const title = content('meta[property="og:description"]').attr('content');
                const image = content('meta[property="og:image"]').attr('content');
                const description = art(path.join(__dirname, 'templates/desc.art'), {
                    image,
                });
                // Pull the date out of the URL
                const pubDate = parseDate(link.substring(link.lastIndexOf('/') + 1), 'YYYY-MM-DD');

                return {
                    title,
                    author,
                    category: 'comic',
                    description,
                    pubDate,
                    link,
                };
            })
        )
    );

    ctx.set('data', {
        title: comic,
        link: url,
        image: $('.feature-logo').attr('src'),
        item: items,
        language: 'en-US',
    });
};
