import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    categories: ['blog'],
    example: '/wangwusiwj',
    parameters: { id: 'RSS 抓取地址：https://wangwusiwj.blogspot.com/:id?，默认为当前年份' },
    name: '文章',
    maintainers: ['prnake'],
    handler,
};

async function handler(ctx: Context) {
    const { id = String(new Date().getFullYear()) } = ctx.req.param();
    const url = `https://wangwusiwj.blogspot.com/${id}`;
    const [response, sitemap] = await Promise.all([ofetch(url), ofetch('https://wangwusiwj.blogspot.com/sitemap.xml', { responseType: 'text' })]);

    const $ = load(response);
    const $sitemap = load(sitemap, { xml: true });
    const pubDates = new Map(
        $sitemap('url')
            .toArray()
            .map((e) => [$sitemap(e).find('loc').text(), $sitemap(e).find('lastmod').text()])
    );

    const list = $('div.post')
        .toArray()
        .map((e) => {
            const link = $(e).find('h3 > a').attr('href');
            return {
                title: $(e).find('h3 > a').text(),
                description: $(e).find('.post-body').html(),
                link,
                author: '王五四',
                pubDate: parseDate(pubDates.get(link!)!),
            };
        });

    return {
        title: '王五四文集',
        link: url,
        item: list,
    };
}
