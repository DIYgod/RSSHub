// @ts-nocheck
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import got from '@/utils/got';
import { load } from 'cheerio';
const host = 'https://techcrunch.com';
export default async (ctx) => {
    const rssUrl = `${host}/feed/`;
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const url = item.link;
                const response = await got({
                    url,
                    method: 'get',
                });
                const html = response.data;
                const $ = load(html);
                const description = $('#root');
                description.find('.article__title').remove();
                description.find('.article__byline__meta').remove();
                return {
                    title: item.title,
                    pubDate: item.pubDate,
                    link: item.link,
                    category: item.categories,
                    description: description.html(),
                };
            })
        )
    );

    ctx.set('data', {
        title: 'TechCrunch',
        link: host,
        description: 'Reporting on the business of technology, startups, venture capital funding, and Silicon Valley.',
        item: items,
    });
};
