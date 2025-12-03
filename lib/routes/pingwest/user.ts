import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import utils from './utils';

export const route: Route = {
    path: '/user/:uid/:type?/:option?',
    categories: ['new-media'],
    example: '/pingwest/user/7781550877/article',
    parameters: { uid: '用户id, 可从用户主页中得到', type: '内容类型, 默认为`article`', option: '参数' },
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
            source: ['pingwest.com/user/:uid/:type', 'pingwest.com/'],
            target: '/user/:uid/:type',
        },
    ],
    name: '用户',
    maintainers: ['sanmmm'],
    handler,
    description: `内容类型

| 文章    | 动态  |
| ------- | ----- |
| article | state |

  参数

  -   \`fulltext\`，全文输出，例如：\`/pingwest/user/7781550877/article/fulltext\``,
};

async function handler(ctx) {
    const { uid, type = 'article', option } = ctx.req.param();
    const baseUrl = 'https://www.pingwest.com';
    const aimUrl = `${baseUrl}/user/${uid}/${type}`;
    const { userName, realUid, userSign, userAvatar } = await cache.tryGet(`pingwest:user:info:${uid}`, async () => {
        const res = await got(aimUrl, {
            headers: {
                Referer: baseUrl,
            },
        });
        const $ = load(res.data);
        const userInfoNode = $('#J_userId');
        return {
            userName: userInfoNode.text(),
            realUid: userInfoNode.attr('data-user-id'),
            userSign: $('#J_userSign').text(),
            userAvatar: $('#J_userAvatar').attr('src'),
        };
    });
    const url = `${baseUrl}/api/user_data`;
    const response = await got(url, {
        searchParams: {
            page: 1,
            user_id: realUid,
            tab: type,
        },
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(response.data.data.list);

    let item = [];
    const needFullText = option === 'fulltext';
    switch (type) {
        case 'article':
            item = await utils.articleListParser($, needFullText, cache);
            break;
        case 'state':
            item = utils.statusListParser($);
            break;
    }

    const typeToLabel = {
        article: '文章',
        state: '动态',
    };
    return {
        title: `品玩 - ${userName} - ${typeToLabel[type]}`,
        description: userSign,
        image: userAvatar,
        link: aimUrl,
        item,
    };
}
