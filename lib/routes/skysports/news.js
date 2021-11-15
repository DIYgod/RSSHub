import got from '~/utils/got.js';
import cheerio from 'cheerio';
import { parseDate } from '~/utils/parse-date.js'

export default async (ctx) => {
    const team = ctx.params.team;

    const rootUrl = 'https://www.skysports.com';
    const currentUrl = `${rootUrl}/${team}-news`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.news-list__headline-link')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.sdc-article-widget, .sdc-site-layout-sticky-region').remove();

                item.description = content('.sdc-article-body').html();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished": "(.*)","dateModified"/)[1]);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
