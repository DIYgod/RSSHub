const got = require('@/utils/got');

module.exports = {
    getUserFullInfo: (ctx, uid) => {
        const key = 'mihoyo:user-full-info-uid-' + uid;
        return ctx.cache.tryGet(key, async () => {
            const query = new URLSearchParams({
                uid,
                gids: 2,
            }).toString();
            const url = `https://bbs-api.miyoushe.com/user/wapi/getUserFullInfo?${query}`;
            const response = await got({
                method: 'get',
                url,
                headers: {
                    Referer: `https://www.miyoushe.com/ys/accountCenter/postList?id=${uid}`,
                },
            });
            const userInfo = response?.data?.data?.user_info;
            if (!userInfo) {
                throw new Error('未获取到数据！');
            }
            const { nickname, introduce, gender, certification, avatar_url } = userInfo;
            return {
                nickname,
                introduce,
                gender,
                certification,
                avatar_url,
            };
        });
    },
};
