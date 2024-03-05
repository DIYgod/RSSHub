// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { config } from '@/config';

module.exports = {
    getUserFullInfo: (ctx, uid) => {
        if (!uid && !config.mihoyo.cookie) {
            throw new Error('GetUserFullInfo is not available due to the absense of [Miyoushe Cookie]. Check <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config tutorial</a>');
        }
        uid ||= '';
        const key = 'mihoyo:user-full-info-uid-' + uid;
        return cache.tryGet(key, async () => {
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
                    Cookie: config.mihoyo.cookie,
                },
            });
            const userInfo = response?.data?.data?.user_info;
            if (!userInfo) {
                throw new Error('未获取到数据！');
            }
            const { nickname, introduce, gender, certification, avatar_url, uid: userId } = userInfo;
            return {
                nickname,
                introduce,
                gender,
                certification,
                avatar_url,
                uid: userId,
            };
        });
    },
};
