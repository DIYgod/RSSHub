// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export default async (ctx) => {
    const language = ctx.req.param('language') ?? 'en';

    const rootUrl = 'https://ici.radio-canada.ca';
    const apiRootUrl = 'https://services.radio-canada.ca';
    const currentUrl = `${apiRootUrl}/neuro/sphere/v1/rci/${language}/continuous-feed?pageSize=50`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.lineup.items.map((item) => ({
        title: item.title,
        category: item.kicker,
        link: `${rootUrl}${item.url}`,
        pubDate: parseDate(item.date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(detailResponse.data);
                const rcState = $('script:contains("window._rcState_ = ")')
                    .text()
                    .match(/window\._rcState_ = (.*);/)[1];
                const rcStateJson = JSON.parse(rcState);
                const news = Object.values(rcStateJson.pagesV2.pages)[0];
                item.description = news.data.newsStory.body.html.replaceAll('\\n', '<br>');

                return item;
            })
        )
    );

    ctx.set('data', {
        title: response.data.meta.title,
        link: response.data.metric.metrikContent.omniture.url,
        item: items,
    });
};
