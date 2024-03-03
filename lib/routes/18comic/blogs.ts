// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const { defaultDomain, getRootUrl } = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';
    const { domain = defaultDomain } = ctx.req.query();
    const rootUrl = getRootUrl(domain);

    const currentUrl = `${rootUrl}/blogs${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.parent().attr('href')}`,
                guid: `https://18comic.org${item.parent().attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.pubDate = parseDate(content('.date').first().text());

                content('.d-flex').remove();

                item.author = content('.blog_name_id').first().text();
                item.description = content('.blog_content').html();
                item.category = content('.panel-heading dropdown-toggle')
                    .toArray()
                    .map((c) => $(c).text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title')
            .text()
            .replace(/最新的/, $('.article-nav .active').text()),
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
    });
};
