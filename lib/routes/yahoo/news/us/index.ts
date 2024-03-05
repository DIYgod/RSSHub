// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const region = ctx.req.param('region') === 'en' ? '' : ctx.req.param('region').toLowerCase();
    if (!isValidHost(region) && region !== '') {
        throw new Error('Invalid region');
    }
    const category = ctx.req.param('category') ? ctx.req.param('category').toLowerCase() : '';
    const rssUrl = `https://${region ? `${region}.` : ''}news.yahoo.com/rss/${category}`;
    const feed = await parser.parseURL(rssUrl);
    const filteredItems = feed.items.filter((item) => !item.link.includes('promotions') && new URL(item.link).hostname.match(/.*\.yahoo\.com$/));
    const items = await Promise.all(
        filteredItems.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = load(response.data);
                const author = `${$('span.caas-author-byline-collapse').text()} @${$('span.caas-attr-provider').text()}`;
                $('.caas-content-byline-wrapper, .caas-xray-wrapper, .caas-header, .caas-readmore').remove();
                const description = $('.caas-content-wrapper').html();

                const single = {
                    title: item.title,
                    description,
                    author,
                    pubDate: item.pubDate,
                    link: item.link,
                };
                return single;
            })
        )
    );

    ctx.set('data', {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    });
};
