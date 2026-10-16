import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';

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

- Visit ft.com -> myFT -> Contact Preferences to enable personal RSS feed, see [help.ft.com](https://help.ft.com/faq/email-alerts-and-contact-preferences/what-is-myft-rss-feed/)
- Obtain the key from the personal RSS address, it looks like \`12345678-abcd-4036-82db-vdv20db024b8\`

:::`,
};

function isForbiddenChallenge(error: unknown): error is FetchError {
    if (!(error instanceof FetchError) || error.status !== 403 || typeof error.data?.body !== 'string') {
        return false;
    }

    const $ = load(error.data.body);
    return ['Security Verification', 'Just a moment...'].includes($('title').text().trim());
}

async function handler(ctx) {
    const link = `https://www.ft.com/myft/following/${ctx.req.param('key')}.rss`;

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link!, async () => {
                let response;
                try {
                    response = await got({
                        method: 'get',
                        url: item.link,
                        headers: {
                            Referer: 'https://www.facebook.com',
                        },
                    });
                } catch (error) {
                    if (!item.content || !isForbiddenChallenge(error)) {
                        throw error;
                    }

                    return { ...item, description: item.content, category: item.categories };
                }

                const $ = load(response.data);
                const content = $('article.js-article__content-body');
                if (!content.html()?.trim() && item.content) {
                    return { ...item, description: item.content, category: item.categories };
                }
                content.find('div.o-share, aside, div.o-ads').remove();

                item.description = content.html();
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
        title: 'FT.com - myFT',
        link: 'https://www.ft.com/myft',
        description: 'FT.com - myFT',
        item: items as DataItem[],
    };
}
