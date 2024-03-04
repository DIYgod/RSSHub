// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = `https://github.com/topics/${ctx.req.param('name')}`;
    const { data, url } = await got(link, {
        searchParams: new URLSearchParams(ctx.req.param('qs')),
    });
    const $ = load(data);

    ctx.set('data', {
        title: $('title').text(),
        description: $('.markdown-body').text().trim(),
        link: url,
        item: $('article.my-4')
            .toArray()
            .map((item) => {
                item = $(item);

                const title = item.find('h3').text().trim();
                const author = title.split('/')[0];
                const description = (item.find('a img').prop('outerHTML') ?? '') + item.find('div > div > p').text();
                const link = `https://github.com${item.find('h3 a').last().attr('href')}`;
                const category = item
                    .find('.topic-tag')
                    .toArray()
                    .map((item) => $(item).text().trim());
                const pubDate = parseDate(item.find('relative-time').attr('datetime'));

                return {
                    title,
                    author,
                    description,
                    link,
                    category,
                    pubDate,
                };
            }),
    });
};
