const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { getContent } = require('./util');

module.exports = async (ctx) => {
    const userId = ctx.params.user_id;
    const category = ctx.params.category;
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;

    const main = await getContent(url, ctx.cache);
    const userDetail = main.userDetail;
    const description = `${userDetail.nickname} • 小红书 / RED`;
    if (category === 'notes') {
        const list = main.notesDetail;
        const resultItem = list.map((item) => ({
            title: item.title,
            link: `https://www.xiaohongshu.com/discovery/item/${item.id}`,
            description: `<img src ="${item.cover.url.split('?imageView2')[0]}"><br>${item.title}`,
            author: item.user.nickname,
            pubDate: timezone(parseDate(item.time), 8),
        }));

        const title = `小红书-${userDetail.nickname}-笔记`;
        ctx.state.data = {
            title,
            link: url,
            item: resultItem,
            description,
        };
    } else if (category === 'album') {
        const list = main.albumDetail;
        const resultItem = list.map((item) => ({
            title: item.title,
            link: `https://www.xiaohongshu.com/board/${item.id}`,
            description: item.images.map((it) => `<img src ="${it.split('?imageView2')[0]}">`).join(`<br>`),
        }));

        const title = `小红书-${userDetail.nickname}-专辑`;
        ctx.state.data = {
            title,
            link: url,
            item: resultItem,
            description,
        };
    }
};
