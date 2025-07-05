import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/wainao-reads',
    categories: ['new-media'],
    example: '/wainao/wainao-reads',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    url: 'www.wainao.me',
    name: '歪脑读',
    maintainers: ['lucky13820'],
    radar: [
        {
            source: ['www.wainao.me', 'www.wainao.me/wainao-reads'],
            target: '/wainao-reads',
        },
    ],
    handler,
};

async function handler() {
    const apiUrl = 'https://www.wainao.me/pf/api/v3/content/fetch/content-api-collections?query={"content_alias":"wainao-hero"}&d=81&_website=wainao';
    const baseUrl = 'https://www.wainao.me';

    const response = await got(apiUrl);
    const data = JSON.parse(response.body);

    const items = data.content_elements.map((item) => ({
        title: item.headlines.basic,
        description: item.description?.basic || '',
        link: baseUrl + item.canonical_url,
        pubDate: parseDate(item.publish_date),
        image: item.promo_items?.basic?.url || '',
    }));

    return {
        title: '歪脑读 - 歪脑',
        link: baseUrl,
        item: items,
    };
}
