import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:team',
    categories: ['new-media'],
    example: '/skysports/news/ac-milan',
    parameters: { team: 'Team id, can be found in URL to the team page' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const team = ctx.req.param('team');

    const rootUrl = 'https://www.skysports.com';
    const currentUrl = `${rootUrl}/${team}-news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.news-list__headline-link')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.roadblock').remove();
                content('.sdc-article-widget, .sdc-site-layout-sticky-region').remove();

                item.description = content('.sdc-article-body, .polaris-tile-group-separator').html();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished": ?"(.*)","dateModified"/)[1]);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
