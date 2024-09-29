import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
// import { parseDate } from '@/utils/parse-date';
// import timezone from '@/utils/timezone';

const baseUrl = 'https://www.resonac.com';
const host = 'https://www.resonac.com/products?intcid=glnavi_products';

export const route: Route = {
    path: '/products',
    categories: ['other'],
    example: '/resonac/products',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Resonac_Products',
    maintainers: ['valuex'],
    handler,
    description: '',
};

async function handler() {
    const response = await got(host);
    const pageHtml = response.data;
    const $ = load(pageHtml);
    const groupLists = $('div.m-panel-card-link  ul  li')
        .toArray()
        .map((el) => ({
            groupName: $('a', el).text().trim(),
            groupURL: baseUrl + $('a', el).attr('href'),
        }));

    let lists = await Promise.all(
        groupLists.map((productGroup) =>
            cache.tryGet(productGroup.groupURL, async () => {
                const strUrl = productGroup.groupURL;
                const response = await got(strUrl);
                const $ = load(response.data);
                const item = $('dt.m-toggle__title  div  span')
                    .toArray()
                    .map((el) => ({
                        title: $('a b', el).text().trim() || 'Empty',
                        link: $('a', el).attr('href') || 'undefined',
                        group: item.groupName,
                    }));
                return item;
            })
        )
    );
    // console.log(lists.length);

    lists = lists.filter((item) => item.link !== 'undefined');
    lists = lists.filter((item) => item.title !== 'Empty');

    const items = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    if (!item.link.includes('undefined')) {
                        const productPageUrl = baseUrl + item.link;
                        const response = await got(productPageUrl);
                        const $ = load(response.data);
                        const thisTitle = item.title + '|' + item.group;
                        item.title = thisTitle;
                        item.description = $('main  div.str-section').html();
                        item.pubDate = '2024-09-29'; // item.pubDate;
                        return item;
                    }
                } catch (error) {
                    return (error as Error).message;
                }
            })
        )
    );

    return {
        title: 'Resonac_Products',
        link: baseUrl,
        description: 'Resonac_Products',
        item: items,
    };
}
