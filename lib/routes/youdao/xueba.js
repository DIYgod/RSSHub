const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'http://xueba.youdao.com';
    const apiUrl = `${rootUrl}/yws/mapi/xueba/library?method=search`;
    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            keyword: '',
            begin: 0,
            count: 9,
            primary_category: 4,
        },
    });

    const authors = {};

    for (const author of response.data.xuebas) {
        authors[author.uid] = author.name;
    }

    const list = response.data.notes.map((item) => ({
        type: item.type,
        title: item.title,
        author: item.userId,
        description: item.description,
        pubDate: new Date(item.upt).toUTCString(),
        link: `http://note.youdao.com/publicshare/?type=${item.type}&id=${item.id}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const id = item.link.split('&id=')[1];
                    const contentResponse = await got({
                        method: 'get',
                        url: `http://note.youdao.com/yws/public/${item.type}/${id}`,
                    });
                    if (item.type === 'note') {
                        item.description = contentResponse.data.content;
                    } else {
                        item.description = '';
                        for (const note of contentResponse.data[2]) {
                            item.description += `<h3><a href="http://note.youdao.com/publicshare?id=${id}#/${note.p.split('/')[2]}">${note.tl}</a></h3><p>${note.pp.dg}</p>`;
                        }
                    }
                } catch (e) {
                    return Promise.resolve('');
                } finally {
                    item.author = authors[item.author];
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `学霸感悟 - 有道云笔记`,
        link: rootUrl,
        item: items,
    };
};
