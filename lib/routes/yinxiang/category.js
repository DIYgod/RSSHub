const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const apiUrl = `https://app.yinxiang.com/third/discovery/client/restful/public/category/page?notePageSize=20&lastBlogNoteGuid=&cateGoryId=${id}`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.categoryNoteSnapshotReply.map((item) => ({
        title: item.title,
        link: item.noteGuid,
        author: item.userNickname,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${item.link}`,
                });

                item.link = `https://www.yinxiang.com/everhub/note/${item.link}`;
                item.pubDate = new Date(parseInt(detailResponse.data.blogNote.publishTime)).toUTCString();

                const description = detailResponse.data.blogNote.htmlContent;
                if (description.indexOf('<?xml') < 0) {
                    item.description = description;
                } else {
                    item.description = description.match(/<en-note>(.*)<\/en-note>/)[1];
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${response.data.categoryName} - 印象识堂`,
        link: `https://www.yinxiang.com/everhub/category/${id}`,
        item: items,
    };
};
