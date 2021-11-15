import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const host = 'https://www.steamgifts.com';
const discussionsIndexUrl = url.resolve(host, '/discussions');

export default async (ctx) => {
    const {
        category
    } = ctx.params;

    const categoryUrl = category ? discussionsIndexUrl + `/${category}` : discussionsIndexUrl;
    const response = await got.get(categoryUrl);
    const $ = cheerio.load(response.data);
    const links = $('a.table__column__heading')
        .slice(0, 20)
        .map((i, e) => url.resolve(host, $(e).attr('href')))
        .get();

    const out = await Promise.all(
        links.map(async (link) => {
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    Referer: categoryUrl,
                },
            });

            const $ = cheerio.load(response.data);

            const timestamp = Number($('.comment__actions span').data('timestamp'));
            const date = new Date(timestamp * 1000);

            const item = {
                title: $('title').text(),
                description: $('.comment__description').html(),
                pubDate: date.toUTCString(),
                link,
                guid: link,
            };

            ctx.cache.set(link, JSON.stringify(item));

            return item;
        })
    );

    ctx.state.data = {
        title: `Steamgifts - Discussions - ${category || 'All'}`,
        link: categoryUrl,
        item: out,
    };
};
