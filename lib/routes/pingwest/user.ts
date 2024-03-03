// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const utils = require('./utils');

export default async (ctx) => {
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
    ctx.set('data', {
        title: `品玩 - ${userName} - ${typeToLabel[type]}`,
        description: userSign,
        image: userAvatar,
        link: aimUrl,
        item,
    });
};
