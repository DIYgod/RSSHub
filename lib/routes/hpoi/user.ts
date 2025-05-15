import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const root_url = 'https://www.hpoi.net';

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
    const { user_id, caty } = ctx.req.param();

    const url = `${root_url}/user/${user_id}/hobby?order=actionDate&view=2&favState=${caty}`;
    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const list = $('.collect-hobby-list-small')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: titleMap[caty] + ': ' + item.find('.name').text(),
                link: 'https://www.hpoi.net/' + item.find('.name').attr('href'),
                description: `<img src="${item.find('img').attr('src').replace('/s/', '/n/')}"><br>${item.find('.pay').text()}<br>${item.find('.score').text()}`,
            };
        });

    const title = $('.hpoi-collect-head .info p').eq(0).text() + '的手办 - ' + titleMap[caty];

    return {
        title,
        link: url,
        item: list,
        allowEmpty: true,
    };
}
