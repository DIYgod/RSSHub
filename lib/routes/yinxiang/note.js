const got = require('@/utils/got');

module.exports = async (ctx) => {
    const apiUrl = 'https://app.yinxiang.com/third/discovery/client/restful/public/v2/discovery/homepage?notePageSize=20';
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.blogNote.slice(0, 5).map((item) => ({
        title: item.title,
        link: `https://www.yinxiang.com/everhub/note/${item.noteGuid}`,
        pubDate: new Date(Number.parseInt(item.publishTime)).toUTCString(),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${item.link.split('/note/')[1]}`,
                });

                const description = detailResponse.data.blogNote.htmlContent;
                item.description = description.includes('<?xml') ? description.match(/<en-note>(.*)<\/en-note>/)[1] : description;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '印象剪藏 - 印象识堂',
        link: 'https://www.yinxiang.com/everhub/',
        item: items,
    };
};
