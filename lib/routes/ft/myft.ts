import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';

export const route: Route = {
    path: '/myft/:key',
    categories: ['traditional-media'],
    example: '/ft/myft/rss-key',
    parameters: { key: 'the last part of myFT personal RSS address' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'myFT personal RSS',
    maintainers: ['HenryQW'],
    handler,
    description: `::: tip
  -   Visit ft.com -> myFT -> Contact Preferences to enable personal RSS feed, see [help.ft.com](https://help.ft.com/faq/email-alerts-and-contact-preferences/what-is-myft-rss-feed/)
  -   Obtain the key from the personal RSS address, it looks like \`12345678-abcd-4036-82db-vdv20db024b8\`
:::`,
};

async function handler(ctx) {
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
                        .toArray()
                        .map((e) => $(e).text().trim()),
                ];
                item.author = $('a.n-content-tag--author')
                    .toArray()
                    .map((e) => ({ name: $(e).text() }));

                return item;
            })
        )
    );

    return {
        title: `FT.com - myFT`,
        link,
        description: `FT.com - myFT`,
        item: items,
    };
}
