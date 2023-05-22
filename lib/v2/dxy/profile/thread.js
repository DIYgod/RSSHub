const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { webBaseUrl, generateNonce, sign, getPost } = require('../utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { userId } = ctx.params;
    const { limit = '30' } = ctx.query;

    const userInfo = await ctx.cache.tryGet(`dxy:user-info:${userId}`, async () => {
        const userInfoParams = {
            userId,
            serverTimestamp: Date.now(),
            timestamp: Date.now(),
            noncestr: generateNonce(8, 'number'),
        };

        const { data: userInfo } = await got(`${webBaseUrl}/bbs/newweb/personal-page/user-info`, {
            searchParams: {
                ...userInfoParams,
                sign: sign(userInfoParams),
            },
        });
        if (userInfo.code !== 'success') {
            throw Error(userInfo.message);
        }

        return userInfo.data;
    });

    const postList = await ctx.cache.tryGet(
        `dxy:user:post:${userId}`,
        async () => {
            const postListParams = {
                userId,
                type: '0',
                pageNum: '1',
                pageSize: limit,
                serverTimestamp: Date.now(),
                timestamp: Date.now(),
                noncestr: generateNonce(8, 'number'),
            };

            const { data: postList } = await got(`${webBaseUrl}/bbs/newweb/user/post/page`, {
                searchParams: {
                    ...postListParams,
                    sign: sign(postListParams),
                },
            });
            if (postList.code !== 'success') {
                throw Error(postList.message);
            }

            return postList.data;
        },
        config.cache.routeExpire,
        false
    );

    const list = postList.result.map((item) => {
        const { postInfo } = item;
        return {
            title: postInfo.subject,
            description: postInfo.simpleBody,
            pubDate: parseDate(item.createdTime, 'x'),
            author: postInfo.postUser.nickname,
            category: postInfo.boardInfo.title,
            link: `${webBaseUrl}/bbs/newweb/pc/post/${item.entityId}`,
            postId: item.entityId,
        };
    });

    const items = await Promise.all(list.map((item) => getPost(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `${userInfo.nickname} 的个人主页 - 丁香园论坛 - 专业医生社区，医学、药学、生命科学、科研学术交流`,
        description: `${userInfo.identificationTitle} ${userInfo.signature}`,
        link: `${webBaseUrl}/bbs/newweb/pc/profile/${userId}/threads`,
        image: userInfo.avatar,
        item: items,
    };
};
