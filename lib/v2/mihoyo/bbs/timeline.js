const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const cache = require('./cache');
const config = require('@/config').value;

const renderDescription = (description, images) => art(path.join(__dirname, '../templates/description.art'), { description, images });

module.exports = async (ctx) => {
    if (!config.mihoyo.cookie) {
        throw 'Miyoushe Timeline is not available due to the absense of [Miyoushe Cookie]. Check <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config tutorial</a>';
    }

    const page_size = ctx.query.limit || '20';
    const searchParams = {
        gids: 2,
        page_size,
    };
    const link = 'https://www.miyoushe.com/ys/timeline';
    const url = 'https://bbs-api.miyoushe.com/post/wapi/timelines';
    const response = await got({
        method: 'get',
        url,
        searchParams,
        headers: {
            Referer: link,
            Cookie: config.mihoyo.cookie,
        },
    });
    const list = response?.data?.data?.list;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const { nickname: username } = await cache.getUserFullInfo(ctx, '');
    const title = `米游社 - ${username} 的关注动态`;
    const items = list.map((e) => {
        const author = e.user.nickname;
        const title = e.post.subject;
        const link = `https://www.miyoushe.com/ys/article/${e.post.post_id}`;
        let describe = e.post.content || '';
        try {
            describe = JSON.parse(e.post.content).describe;
        } catch (error) {
            if (!(error instanceof SyntaxError)) {
                throw error;
            }
        }
        const description = renderDescription(describe || '', [...new Set([e.post.cover, ...e.post.images])].filter(Boolean));
        const pubDate = parseDate(e.post.created_at * 1000);
        const upvotes = e.stat.like_num;
        const comments = e.stat.reply_num;
        return {
            author,
            title,
            link,
            description,
            pubDate,
            upvotes,
            comments,
        };
    });

    const data = {
        title,
        link,
        item: items,
    };
    ctx.state.data = data;
};
