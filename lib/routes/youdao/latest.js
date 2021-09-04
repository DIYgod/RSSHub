const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'http://xueba.youdao.com';
    const apiUrl = `${rootUrl}/yws/mapi/xueba/library?method=realTimeCollect&count=10`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.Clt.map((item) => ({
        title: `${item.name} 保存了 ${item.title}`,
        pubDate: new Date(item.time).toUTCString(),
        link: `http://note.youdao.com/publicshare/?id=${item.shareKey}`,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const id = item.link.split('?id=')[1];
                    try {
                        const contentResponse = await got({
                            method: 'get',
                            url: `http://note.youdao.com/yws/public/notebook/${id}`,
                        });
                        item.description = '';
                        for (const note of contentResponse.data[2]) {
                            item.description += `<h3><a href="http://note.youdao.com/publicshare?id=${id}#/${note.p.split('/')[2]}">${note.tl}</a></h3><p>${note.pp.dg}</p>`;
                        }
                    } catch (e) {
                        const contentResponse = await got({
                            method: 'get',
                            url: `http://note.youdao.com/yws/public/note/${id}`,
                        });
                        item.description = contentResponse.data.content;
                    }
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `笔记最新动态 - 有道云笔记`,
        link: rootUrl,
        item: items,
    };
};
