import { load } from 'cheerio';
import type { Context } from 'hono';

import cache from '@/utils/cache';
import got from '@/utils/got';

import type { Data, DataItem, Route } from '@/types';

export const route: Route = {
    path: '/zl',
    categories: ['travel'],
    example: '/chnmuseum/zl',
    name: 'Current Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['https://www.chnmuseum.cn/zl/'],
            target: '/zl',
        },
    ],
    handler: async (ctx: Context): Promise<Data> => {
        const baseUrl = 'https://www.chnmuseum.cn';
        const url = `${baseUrl}/zl/`;

        const response = await got(url);
        const $ = load(response.data);

        const list: DataItem[] = await Promise.all(
            $('ul#div li')
                .toArray()
                .map(async (item) => {
                    const $item = $(item);
                    const $link = $item.find('a.recurl');

                    const relativeLink = $link.attr('href') || '';
                    const itemLink = relativeLink.startsWith('.')
                        ? new URL(relativeLink, url).href
                        : `${baseUrl}${relativeLink}`;

                    const title = $item.find('div.cj_zxx3 p').text().trim();
                    const imgUrl = new URL($item.find('img').first().attr('src') || '', url).href;
                    const location = $item.find('div.cj_zxx1').text().trim();
                    let duration = $item.find('div.cj_zxx2 p').text().trim();

                    if (duration.endsWith('...') || duration.endsWith('……')) {
                        duration = (await cache.tryGet(itemLink, async () => {
                            const detailResponse = await got(itemLink);
                            const html = detailResponse.data;
                            const dateRegex = /var\s+qtxszq\s*=\s*"(.*?)";/;
                            const match = html.match(dateRegex);
                            return match && match[1] ? match[1] : duration;
                        })) as string;
                    }

                    return {
                        title,
                        link: itemLink,
                        description: `<div><img src="${imgUrl}" /><br /><p><b>地点：</b>${location}</p><p><b>展期：</b>${duration}</p></div>`,
                    };
                })
        );

        return {
            title: '中国国家博物馆 - 正在展出',
            link: url,
            language: 'zh-CN',
            item: list,
        };
    },
};