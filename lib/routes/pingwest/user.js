const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { uid, type = 'article' } = ctx.params;
    const baseUrl = 'https://www.pingwest.com';
    const aimUrl = `${baseUrl}/user/${uid}/${type}`;
    const { userName, realUid } = await ctx.cache.tryGet(`pingwest-user-info-${uid}`, async () => {
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
    switch (type) {
        case 'article':
            item = utils.articleListParser($);
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
        description: `品玩 - ${userName} - ${typeToLabel[type]}`,
        link: aimUrl,
        item,
    };
};
