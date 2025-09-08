import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:channel',
    categories: ['finance'],
    example: '/fx-markets/trading',
    parameters: { channel: 'channel, can be found in the navi bar links at the home page' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Channel',
    maintainers: [],
    handler,
    description: `| Trading | Infrastructure | Tech and Data | Regulation |
| ------- | -------------- | ------------- | ---------- |
| trading | infrastructure | tech-and-data | regulation |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const link = `https://www.fx-markets.com/${channel}`;
    const html = (await got(link)).data;
    const $ = load(html);
    const pageTitle = $('header.select-header > h1').text();
    const title = `FX-Markets ${pageTitle}`;

    const items = $('div#listings').children();
    const articles = items.toArray().map((el) => {
        const $el = $(el);
        const $titleEl = $el.find('h5 > a');
        const articleURL = `https://www.fx-markets.com${$titleEl.attr('href')}`;
        const articleTitle = $titleEl.attr('title');
        return {
            title: articleTitle,
            link: articleURL,
            pubDate: parseDate($el.find('time').text()),
        };
    });

    const result = await Promise.all(
        articles.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got(item.link);
                const doc = load(res.data);
                // This script holds publish datetime info {"datePublished": "2022-05-12T08:45:04+01:00"}
                const dateScript = doc('script[type="application/ld+json"]').toArray()[0].children[0].data;
                const re = /"datePublished": "(?<dateTimePub>.*)"/;
                const dateStr = re.exec(dateScript).groups.dateTimePub;
                const pubDateTime = parseDate(dateStr, 'YYYY-MM-DDTHH:mm:ssZ');
                // Exclude hidden print message
                item.description = doc('div.article-page-body-content:not(.print-access-info)').html();
                return {
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    // if we fail to get accurate publish date time, show date only from article link on index page.
                    pubDate: pubDateTime ?? item.pubDate,
                };
            })
        )
    );

    return {
        title,
        link,
        item: result,
    };
}
