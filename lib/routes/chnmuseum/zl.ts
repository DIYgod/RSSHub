import { load } from 'cheerio';
import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/zl',
    categories: ['travel'],
    example: '/chnmuseum/zl',
    name: '中国国家博物馆 - 展览',
    maintainers: ['magazian'],
    handler: async () => {
        const baseUrl = 'https://www.chnmuseum.cn';
        const url = `${baseUrl}/zl/`;

        const response = await got(url);
        const $ = load(response.data);

        const list = $('ul#div li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const $link = $item.find('a.recurl');

                const relativeLink = $link.attr('href') || '';
                const itemLink = relativeLink.startsWith('.')
                    ? new URL(relativeLink, url).href
                    : `${baseUrl}${relativeLink}`;

                const title = $item.find('div.cj_zxx3 p').text().trim();
                const imgUrl = new URL($item.find('img').first().attr('src') || '', url).href;
                const location = $item.find('div.cj_zxx1').text().trim();
                const duration = $item.find('div.cj_zxx2 p').text().trim();

                return {
                    title,
                    link: itemLink,
                    description: `
                        <img src='${imgUrl}'><br>
                        <p><b>地点：</b>${location}</p>
                        <p><b>展期：</b>${duration}</p>
                    `.trim(),
                };
            });

        return {
            title: '中国国家博物馆 - 展览',
            link: url,
            item: list,
        };
    },
};
