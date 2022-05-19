const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
// 游戏id
const GITS_MAP = {
    1: '崩坏三',
    2: '原神',
    3: '崩坏二',
    4: '未定事件簿',
    6: '崩坏：星穹铁道',
};

// 公告类型
const TYPE_MAP = {
    1: '公告',
    2: '活动',
    3: '资讯',
};

const renderDescription = (description, images) => art(path.join(__dirname, 'templates/description.art'), { description, images });

module.exports = async (ctx) => {
    const { gids, type = '2', page_size = '20', last_id = '' } = ctx.params;
    const query = new URLSearchParams({
        gids,
        type,
        page_size,
        last_id,
    }).toString();
    const url = `https://bbs-api.mihoyo.com/post/wapi/getNewsList?${query}`;
    const response = await got({
        method: 'get',
        url,
    });
    const list = response?.data?.data?.list;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const title = `米游社 - ${GITS_MAP[gids] || ''} - ${TYPE_MAP[type] || ''}`;
    const items = list.map((e) => {
        const author = e.user.nickname;
        const title = e.post.subject;
        const link = `https://bbs.mihoyo.com/ys/article/${e.post.post_id}`;
        const description = renderDescription(e.post.content, e.post.images);
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
        link: url,
        item: items,
    };

    ctx.state.data = data;
};
