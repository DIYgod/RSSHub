import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/briefing-room/:category?',
    categories: ['government'],
    example: '/whitehouse/briefing-room',
    parameters: { category: 'Category, see below, all by default' },
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
            source: ['whitehouse.gov/briefing-room/:category', 'whitehouse.gov/'],
            target: '/briefing-room/:category',
        },
    ],
    name: 'Briefing Room',
    maintainers: ['nczitzk'],
    handler,
    description: `| All | Blog | Legislation | Presidential Actions | Press Briefings | Speeches and Remarks | Statements and Releases |
  | --- | ---- | ----------- | -------------------- | --------------- | -------------------- | ----------------------- |
  |     | blog | legislation | presidential-actions | press-briefings | speeches-remarks     | statements-releases     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://www.whitehouse.gov';
    const currentUrl = `${rootUrl}/briefing-room/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.news-item__title')
        .slice(0, 10)
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
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('.body-content').html();
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

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
