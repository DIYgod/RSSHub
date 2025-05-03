import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const host = 'https://www.zhihu.com';

export const route: Route = {
    path: '/weekly',
    categories: ['social-media'],
    example: '/zhihu/weekly',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/pub/weekly'],
        },
    ],
    name: '知乎书店 - 知乎周刊',
    maintainers: ['LogicJake'],
    handler,
    url: 'www.zhihu.com/pub/weekly',
};

async function handler() {
    const link = 'https://www.zhihu.com/pub/weekly';
    const response = await got(link);
    const $ = load(response.data);

    const description = $('p.Weekly-description').text();
    const out = $('div.Card-section.PubBookListItem')
        .slice(0, 10)
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('span.PubBookListItem-title').text(),
                link: new URL($(element).find('a.PubBookListItem-buttonWrapper').attr('href'), host).href,
                description: $(element).find('div.PubBookListItem-description').text(),
                author: $(element).find('span.PubBookListItem-author').text(),
            };
            return info;
        });

    return {
        title: '知乎周刊',
        link,
        description,
        item: out,
    };
}
