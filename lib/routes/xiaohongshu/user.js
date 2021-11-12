const { getContent } = require('@/routes/xiaohongshu/util');

const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const userId = ctx.params.user_id;
    const category = ctx.params.category;
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;

    const content = await getContent(url);
    const $ = cheerio.load(content);
    const description = $('head title').html();
    const regex = /_SSR_STATE__\S*=([\s\S]+)<\/script>/gm;
    const match = regex.exec(content);
    const main = JSON.parse(match[1]).Main;
    const userDetail = main.userDetail;
    if (category === 'notes') {
        const list = main.notesDetail;
        const resultItem = list.map((item) => ({
            title: item.title,
            link: `https://www.xiaohongshu.com/discovery/item/${item.id}`,
            description: `<img src ="${item.cover.url}"><br>${item.title}`,
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
            description: item.images.map((it) => `<img src ="${it}">`).join(`<br />`),
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
