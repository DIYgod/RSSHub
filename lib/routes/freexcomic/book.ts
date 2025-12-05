import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const jjmhw = 'http://www.jjmhw.cc';

const getLatestAddress = () =>
    cache.tryGet('freexcomic:getLatestAddress', async () => {
        const portalResponse = await ofetch('https://www.freexcomic.com');
        const $portal = cheerio.load(portalResponse);
        const portalUrl = new URL($portal('.alert-btn').attr('href')).href.replace('http:', 'https:');

        const addressList = await ofetch(portalUrl);
        const $address = cheerio.load(addressList);

        return $address('p.ta-c.mb10 a')
            .toArray()
            .map((item) => $address(item).attr('href'));
    });

const handler = async (ctx) => {
    const { id } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit'), 10) || 10;
    const addresses = (await getLatestAddress()) as string[];
    const link = `${addresses[0]}book/${id}`;

    const response = await ofetch(link);
    const $ = cheerio.load(response);

    const list = $('#detail-list-select > li > a')
        .toArray()
        .toReversed()
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href'), addresses[Math.floor(Math.random() * addresses.length)]).href,
                guid: new URL($item.attr('href'), jjmhw).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);

                const comicpage = $('.comicpage');
                comicpage.find('img').each((_, ele) => {
                    ele.attribs.src = ele.attribs['data-original'];
                });

                item.description = comicpage.html();

                return item;
            })
        )
    );

    return {
        title: `漫小肆 ${$('div.info > h1').text()}`,
        link,
        description: `漫小肆 ${$('div.info .content span span').text()}`,
        image: $('.banner_detail .cover img').attr('src'),
        item: items,
    };
};

export const route: Route = {
    path: '/book/:id',
    example: '/freexcomic/book/90',
    parameters: { id: '漫画id，漫画主页的地址栏中' },
    radar: [
        {
            source: ['www.jjmhw.cc/book/:id'],
        },
    ],
    name: '漫画更新',
    maintainers: ['junfengP'],
    handler,
    url: 'www.jjmhw.cc',
    features: {
        nsfw: true,
    },
};
