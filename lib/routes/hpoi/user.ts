// @ts-nocheck
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

export default async (ctx) => {
    const { user_id, caty } = ctx.req.param();

    const url = `${root_url}/user/${user_id}/hobby?order=actionDate&view=2&favState=${caty}`;
    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const list = $('.collect-hobby-list-small')
        .map((_, item) => {
            item = $(item);
            return {
                title: titleMap[caty] + ': ' + item.find('.name').text(),
                link: 'https://www.hpoi.net/' + item.find('.name').attr('href'),
                description: `<img src="${item.find('img').attr('src').replace('/s/', '/n/')}"><br>${item.find('.pay').text()}<br>${item.find('.score').text()}`,
            };
        })
        .get();

    const title = $('.hpoi-collect-head .info p').eq(0).text() + '的手办 - ' + titleMap[caty];

    ctx.set('data', {
        title,
        link: url,
        item: list,
        allowEmpty: true,
    });
};
