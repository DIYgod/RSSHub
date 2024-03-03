// @ts-nocheck
import cache from '@/utils/cache';
// Require necessary modules
import got from '@/utils/got'; // a customised got
import { load } from 'cheerio'; // an HTML parser with a jQuery-like API

export default async (ctx) => {
    // Your logic here
    // Defining base URL
    const baseUrl = 'https://ekantipur.com';

    // Retrive the channel parameter
    const { channel = 'news' } = ctx.req.param();

    // Fetches content of the requested channel
    const { data: response } = await got(`${baseUrl}/${channel}`);
    const $ = load(response);

    // Retrive articles
    const list = $('article.normal')
        // We use the `toArray()` method to retrieve all the DOM elements selected as an array.
        .toArray()
        // We use the `map()` method to traverse the array and parse the data we need from each element.
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                link: `${baseUrl}${a.attr('href')}`,
                author: item.find('div.author').text(),
                category: channel,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                // Remove sponsor elements
                $('a.static-sponsor').remove();
                $('div.ekans-wrapper').remove();

                // Fetch title from the article page
                item.title = $('h1.eng-text-heading').text();
                // Fetch article content from the article page
                item.description = $('div.current-news-block').first().html();

                // Every property of a list item defined above is reused here
                // and we add a new property 'description'
                return item;
            })
        )
    );

    ctx.set('data', {
        // channel title
        title: `Ekantipur - ${channel}`,
        // channel link
        link: `${baseUrl}/${channel}`,
        // each feed item
        item: items,
    });
};
