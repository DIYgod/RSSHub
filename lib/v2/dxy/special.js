const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { phoneBaseUrl, webBaseUrl, generateNonce, sign, getPost } = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { specialId } = ctx.params;
    const { limit = '10' } = ctx.query;

    const specialDetail = await ctx.cache.tryGet(`dxy:special:detail:${specialId}`, async () => {
        const detailParams = {
            specialId,
            requestType: 'h5',
            timestamp: Date.now(),
            noncestr: generateNonce(8, 'number'),
        };

        const { data: detail } = await got(`${phoneBaseUrl}/newh5/bbs/special/detail`, {
            searchParams: {
                ...detailParams,
                sign: sign(detailParams),
            },
        });
        if (detail.code !== 'success') {
            throw Error(detail.message);
        }
        return detail.data;
    });

    const recommendList = await ctx.cache.tryGet(
        `dxy:special:recommend-list-v3:${specialId}`,
        async () => {
            const listParams = {
                specialId,
                requestType: 'h5',
                pageNum: '1',
                pageSize: limit,
                timestamp: Date.now(),
                noncestr: generateNonce(8, 'number'),
            };

            const { data: recommendList } = await got(`${phoneBaseUrl}/newh5/bbs/special/post/recommend-list-v3`, {
                searchParams: {
                    ...listParams,
                    sign: sign(listParams),
                },
            });
            if (recommendList.code !== 'success') {
                throw Error(recommendList.message);
            }
            return recommendList.data;
        },
        config.cache.routeExpire,
        false
    );

    const list = recommendList.result.map((item) => {
        const { postInfo } = item;
        return {
            title: postInfo.subject,
            description: postInfo.simpleBody,
            pubDate: parseDate(item.dataTime, 'x'),
            author: postInfo.postUser.nickname,
            category: postInfo.postSpecial.specialName,
            link: `${webBaseUrl}/bbs/newweb/pc/post/${item.entityId}`,
            postId: item.entityId,
        };
    });

    const items = await Promise.all(list.map((item) => getPost(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: specialDetail.name,
        description: `${specialDetail.content} ${specialDetail.postCount} 內容 ${specialDetail.followCount} 关注`,
        link: `${phoneBaseUrl}/bbs/special?specialId=${specialId}`,
        image: specialDetail.specialAvatar,
        item: items,
    };
};
