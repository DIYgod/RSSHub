import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/investigates',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/reuters/investigates',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Inverstigates',
    maintainers: ['LyleLee'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.reuters.com';
    const currentUrl = `${rootUrl}/investigates/`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('article.section-article-container.row')
        .toArray()
        .map((item) => ({
            title: $(item).find('h2.subtitle').text(),
            link: $(item).find('a.row.d-flex').prop('href'),
        }));
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.title = content('title').text();
                item.description = content('article.special-report').html();
                item.pubDate = parseDate(content('time[itemprop="datePublished"]').attr('datetime'));
                item.author = content('meta[property="og:article:publisher"]').attr('content');

                return item;
            })
        )
    );

    return {
        title: $('h1.series-subtitle').text(),
        link: currentUrl,
        item: items,
    };
}
