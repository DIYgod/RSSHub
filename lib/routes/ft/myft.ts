// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';

export default async (ctx) => {
    const ProcessFeed = (content) => {
        // clean up the article
        content.find('div.o-share, aside, div.o-ads').remove();

        return content.html();
    };

    const link = `https://www.ft.com/myft/following/${ctx.req.param('key')}.rss`;

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: 'https://www.facebook.com',
                    },
                });

                const $ = load(response.data);

                item.description = ProcessFeed($('article.js-article__content-body'));
                item.category = [
                    $('.n-content-tag--with-follow').text(),
                    ...$('.article__right-bottom a.concept-list__concept')
                        .map((i, e) => $(e).text().trim())
                        .get(),
                ];
                item.author = $('a.n-content-tag--author')
                    .map((i, e) => ({ name: $(e).text() }))
                    .get();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `FT.com - myFT`,
        link,
        description: `FT.com - myFT`,
        item: items,
    });
};
