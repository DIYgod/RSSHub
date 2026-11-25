import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/status',
    categories: ['new-media'],
    example: '/pingwest/status',
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
            source: ['pingwest.com/status', 'pingwest.com/'],
        },
    ],
    name: '实时要闻',
    maintainers: ['sanmmm'],
    handler,
    url: 'pingwest.com/status',
};

async function handler() {
    const baseUrl = 'https://www.pingwest.com';
    const url = `${baseUrl}/api/state/list`;
    const response = await got(url, {
        searchParams: {
            page: 1,
        },
    });
    const $ = load(response.data.data.list);
    const items = $('section.item')
        .toArray()
        .map((ele) => {
            const timestamp = ele.attribs['data-t'];
            const $item = $(ele);
            const rightNode = $item.find('.news-info');
            const tag = rightNode.find('.item-tag-list').text();
            const title = rightNode.find('.title').text();
            const link = rightNode.find('a').last().attr('href')!;
            rightNode.find('.title, .item-tag-list').remove();
            let description = rightNode.html() ?? '';
            const imgUrl = $item.find('.news-img img');
            if (imgUrl.length) {
                imgUrl.attr('src', imgUrl.attr('src')!.split('?x-', 1)[0]);
                description += `<br>${imgUrl.parent().html()}`;
            }
            return {
                title: title || tag,
                link: new URL(link, baseUrl).href,
                description,
                pubDate: parseDate(timestamp, 'X'),
                category: tag,
            };
        });

    return {
        title: '品玩 - 实时要闻',
        description: '品玩 - 实时要闻',
        link: `${baseUrl}/status`,
        item: items,
    };
}
