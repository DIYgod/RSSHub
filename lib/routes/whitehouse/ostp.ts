import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ostp',
    categories: ['government'],
    example: '/whitehouse/ostp',
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
            source: ['whitehouse.gov/ostp', 'whitehouse.gov/'],
        },
    ],
    name: 'Office of Science and Technology Policy',
    maintainers: ['LyleLee'],
    handler,
    url: 'whitehouse.gov/ostp',
};

async function handler() {
    const rootUrl = 'https://www.whitehouse.gov';
    const currentUrl = `${rootUrl}/ostp/news-updates`;
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
                item.pubDate = parseDate(content('time.published').attr('datetime'));
                item.author = content('span.tax-links.cat-links > a').text();

                return item;
            })
        )
    );

    return {
        title: 'Whitehouse OSTP',
        link: currentUrl,
        description: 'Whitehouse Office of Science and Technology Policy',
        item: items,
    };
}
