const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const renderDescription = (description, images) => art(path.join(__dirname, '../templates/description.art'), { description, images });

module.exports = async (ctx) => {
    const { uid } = ctx.params;
    const size = ctx.query.limit || '20';
    const query = new URLSearchParams({
        uid,
        size,
    }).toString();
    const link = `https://www.miyoushe.com/ys/accountCenter/postList?id=${uid}`;
    const url = `https://bbs-api.miyoushe.com/post/wapi/userPost?${query}`;
    const response = await got({
        method: 'get',
        url,
    });
    const list = response?.data?.data?.list;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const username = list[0]?.user.nickname;
    const title = `米游社 - ${username} 的发帖`;
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
        const description = renderDescription(describe || '', Array.from(new Set([e.post.cover, ...e.post.images])));
        const pubDate = parseDate(e.post.created_at * 1000);
        return {
            author,
            title,
            link,
            description,
            pubDate,
        };
    });

    const data = {
        title,
        link,
        item: items,
    };
    ctx.state.data = data;
};
