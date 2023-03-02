const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { getBoard } = require('./util');

module.exports = async (ctx) => {
    const url = `https://www.xiaohongshu.com/board/${ctx.params.board_id}`;
    const main = await getBoard(url, ctx.cache);

    const albumInfo = main.albumInfo;
    const title = albumInfo.name;
    const description = albumInfo.desc;
    const image = albumInfo.user.images.split('?imageView2')[0];

    const list = main.notesDetail;
    const resultItem = list.map((item) => ({
        title: item.title,
        link: `https://www.xiaohongshu.com/discovery/item/${item.id}`,
        description: `<img src ="${item.cover.url.split('?imageView2')[0]}"><br>${item.title}`,
        author: item.user.nickname,
        pubDate: timezone(parseDate(item.time), 8),
    }));

    ctx.state.data = {
        title,
        link: url,
        image,
        item: resultItem,
        description,
    };
};
