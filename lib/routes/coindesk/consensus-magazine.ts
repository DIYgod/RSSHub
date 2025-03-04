import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const rootUrl = 'https://www.coindesk.com';

export const route: Route = {
    path: '/consensus-magazine',
    categories: ['new-media'],
    example: '/coindesk/consensus-magazine',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['coindesk.com/'],
        },
    ],
    name: '新闻周刊',
    maintainers: ['jameshih'],
    handler,
    url: 'coindesk.com/',
};

async function handler() {
    const channel = 'consensus-magazine';

    const response = await ofetch(`${rootUrl}/${channel}`);
    const $ = load(response);

    const list = $('div h2')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: rootUrl + $item.parent().attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const ldJson = JSON.parse($('script[type="application/ld+json"]').text());

                $('.article-ad, #strategy-rules-player-wrapper, [data-module-name="newsletter-article-sign-up-module"], div.flex.flex-col.gap-2').remove();
                const cover = $('.article-content-wrapper figure');
                cover.find('img').attr('src', cover.find('img').attr('url')?.split('?')[0]);
                cover.find('img').removeAttr('style srcset url');

                item.description =
                    cover.parent().html() +
                    $('.document-body')
                        .toArray()
                        .map((item) => $(item).html())
                        .join('');
                item.pubDate = parseDate(ldJson.datePublished);
                item.author = ldJson.author.map((a) => ({ name: a.name }));
                item.image = ldJson.image.url.split('?')[0];

                return item;
            })
        )
    );

    return {
        title: 'CoinDesk Consensus Magazine',
        link: `${rootUrl}/${channel}`,
        item: items,
    };
}
