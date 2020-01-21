const got = require('@/utils/got');

module.exports = async (ctx) => {
    const boardId = ctx.params.boardId;
    const link = `https://www.xiaomi.cn/board/${boardId}`;

    const response = await got({
        method: 'get',
        url: `https://prod.api.xiaomi.cn/community/board/home/announce/list?after=&limit=20&boardId=${boardId}`,
        headers: {
            Referer: link,
        },
    });
    const data = response.data.entity.records;
    const name = data && data[0].boards[0].boardName;

    ctx.state.data = {
        title: name + '-小米社区',
        link: link,
        item: data.map((item) => {
            let picTpl = '';
            if (item.picList && item.picList.length) {
                item.picList.forEach((pic) => {
                    picTpl += `<br><img src="${pic.imageUrl}">`;
                });
            }
            return {
                title: item.title || item.textContent,
                description: item.textContent + picTpl,
                pubDate: new Date(item.createTime).toUTCString(),
                author: item.author.name,
                link: `https://www.xiaomi.cn/post/${item.id}`,
            };
        }),
    };
};
