const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const full_url = utils.base_url + `/v6/user/feedList?uid=${uid}&page=1&showAnonymous=0&isIncludeTop=1&showDoing=1`;
    let username;
    const response = await got({
        method: 'get',
        url: full_url,
        headers: utils.getHeaders(),
    });
    const data = response.data.data;
    if (!data) {
        throw Error('这个人没有任何动态。');
    }
    let out = await Promise.all(
        data.map((item) => {
            if (!username) {
                username = item.username;
            }

            return utils.parseDynamic(item, ctx);
        })
    );

    out = out.filter((i) => i); // 去除空值
    if (out.length === 0) {
        throw Error('这个人还没有图文或动态。');
    }
    ctx.state.data = {
        title: `酷安个人动态-${username}`,
        link: `https://www.coolapk.com/u/${uid}`,
        description: `酷安个人动态-${username}`,
        item: out,
    };
};
