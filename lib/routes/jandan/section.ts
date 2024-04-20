import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'top';

    const rootUrl = 'http://i.jandan.net';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('ol.commentlist li')
        .not('.row')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            item.find('.commenttext img, .tucao-report').remove();

            item.find('.commenttext .view_img_link').each(function () {
                const url = new URL($(this).attr('href'), rootUrl);
                url.protocol = 'https:';
                url.host = url.host.replace('moyu.im', 'sinaimg.cn');
                $(this).replaceWith(`<img src="${url}">`);
            });

            const author = item.find('b').first().text();
            const description = item.find('.commenttext');

            return {
                author,
                description: description.html(),
                title: `${author}: ${description.text()}`,
                pubDate: parseDate(item.find('.time').text()),
                link: `${rootUrl}/t/${item.attr('id').split('-').pop()}`,
            };
        });

    return {
        title: `${$('title').text()} - 煎蛋`,
        link: currentUrl,
        item: items,
    };
}
