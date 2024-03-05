// @ts-nocheck
import got from '@/utils/got';
import queryString from 'query-string';
import { load } from 'cheerio';

export default async (ctx) => {
    const baseUrl = 'https://mmda.booru.org';
    const tags = ctx.req.param('tags');

    const query = queryString.stringify(
        {
            tags,
            page: 'post',
            s: 'list',
        },
        {
            skipNull: true,
        }
    );

    const { data: response } = await got(`${baseUrl}/index.php`, {
        searchParams: query,
    });

    const $ = load(response);
    const list = $('#post-list > div.content > div > div:nth-child(3) span')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();

            const scriptStr = item.find('script[type="text/javascript"]').first().text();
            const user = scriptStr.match(/user':'(.*?)'/)?.[1] ?? '';

            return {
                title: a.find('img').first().attr('title'),
                link: `${baseUrl}/${a.attr('href')}`,
                author: user,
                description: a.html(),
            };
        });

    ctx.set('data', {
        title: tags,
        link: `${baseUrl}/index.php?${query}`,
        item: list,
    });
};
