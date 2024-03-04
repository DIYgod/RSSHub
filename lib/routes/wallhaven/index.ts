// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://wallhaven.cc';

export default async (ctx) => {
    const filter = ctx.req.param('filter') ?? 'latest';
    const needDetails = /t|y/i.test(ctx.req.param('needDetails') ?? 'false');
    const url = `${rootUrl}/${filter.indexOf('=') > 0 ? `search?${filter.replaceAll(/page=\d+/g, 'page=1')}` : filter}`;

    const response = await got.get(url);
    const $ = load(response.data);

    let items = $('li > figure.thumb')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 24)
        .map((_, item) => ({
            title: $(item).find('img.lazyload').attr('data-src').split('/').pop(),
            description: $(item)
                .html()
                .match(/<img.*?>/)[0],
            link: $(item).find('a.preview').attr('href'),
        }))
        .get();
    if (needDetails) {
        items = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('meta[name="title"]').attr('content');
                    item.author = content('.username').text();
                    item.pubDate = parseDate(content('time').attr('datetime'));
                    item.category = content('.tagname')
                        .toArray()
                        .map((tag) => content(tag).text());
                    item.description = content('div.scrollbox').html();

                    return item;
                })
            )
        );
    }

    ctx.set('data', {
        title: $('title').text(),
        link: url,
        item: items,
    });
};
