// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { config } from '@/config';
import { load } from 'cheerio';

export default async (ctx) => {
    const version = ctx.req.param('version') ?? '8.0';

    const rootUrl = 'https://dev.mysql.com';
    const currentUrl = `${rootUrl}/doc/relnotes/mysql/${version}/en/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            'user-agent': config.trueUA,
        },
    });

    const $ = load(response.data);

    let items = $('dt span a')
        .slice(1, -1)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${currentUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        'user-agent': config.trueUA,
                    },
                });

                const content = load(detailResponse.data);

                content('.indexterm').remove();
                content('.titlepage').first().remove();
                content('.itemizedlist').first().remove();

                item.description = content('#docs-body .section').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
