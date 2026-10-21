import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

const rootUrl = 'https://www.hpoi.net';

const titleMap = {
    want: '想买',
    preorder: '预定',
    buy: '已入',
    care: '关注',
    resell: '有过',
};

export const route: Route = {
    path: '/user/:user_id/:caty',
    categories: ['anime'],
    example: '/hpoi/user/116297/buy',
    parameters: {
        user_id: {
            description: '用户ID',
        },
        caty: {
            description: '类别',
            options: [
                { value: 'want', label: '想买' },
                { value: 'preorder', label: '预定' },
                { value: 'buy', label: '已入' },
                { value: 'care', label: '关注' },
                { value: 'resell', label: '有过' },
            ],
            default: 'buy',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户动态',
    maintainers: ['DIYgod', 'luyuhuang'],
    handler,
};

async function handler(ctx) {
    const { user_id: userId, caty } = ctx.req.param();
    if (!/^[1-9]\d*$/.test(userId) || !Object.hasOwn(titleMap, caty)) {
        throw new InvalidParameterError('Invalid user_id or caty: expected a positive user ID and a documented collection category.');
    }

    const url = `${rootUrl}/user/${userId}/hobby?order=actionDate&view=2&favState=${caty}`;
    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const list = $('.collect-hobby-list-small')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: titleMap[caty] + ': ' + $item.find('.name').text(),
                link: new URL($item.find('.name').attr('href')!, url).href,
                description: `<img src="${$item.find('img').attr('src')!.replace('/s/', '/n/')}"><br>${$item.find('.pay').text()}<br>${$item.find('.score').text()}`,
            };
        });

    const title = $('.hpoi-collect-head .info p').eq(0).text() + '的手办 - ' + titleMap[caty];

    return {
        title,
        link: url,
        item: list,
    };
}
