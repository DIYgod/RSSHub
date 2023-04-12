const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { uid, type = 'article', option } = ctx.params;
    const baseUrl = 'https://www.pingwest.com';
    const aimUrl = `${baseUrl}/user/${uid}/${type}`;
    const { userName, realUid, userSign, userAvatar } = await ctx.cache.tryGet(`pingwest:user:info:${uid}`, async () => {
        const res = await got(aimUrl, {
            headers: {
                Referer: baseUrl,
            },
        });
        const $ = cheerio.load(res.data);
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
    const $ = cheerio.load(response.data.data.list);

    let item = [];
    const needFullText = option === 'fulltext';
    switch (type) {
        case 'article':
            item = await utils.articleListParser($, needFullText, ctx.cache);
            break;
        case 'state':
            item = utils.statusListParser($);
            break;
    }

    const typeToLabel = {
        article: '文章',
        state: '动态',
    };
    ctx.state.data = {
        title: `品玩 - ${userName} - ${typeToLabel[type]}`,
        description: userSign,
        image: userAvatar,
        link: aimUrl,
        item,
    };
};
