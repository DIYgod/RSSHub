const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id || '32';

    const apiUrl = `https://app.yinxiang.com/third/discovery/client/restful/public/discovery/card-holder?cardHolderId=${id}`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.card.map((item) => ({
        title: item.title,
        link: item.url,
        author: item.userNickname,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${item.link.split('/note/')[1]}`,
                });

                item.pubDate = new Date(Number.parseInt(detailResponse.data.blogNote.publishTime)).toUTCString();

                const description = detailResponse.data.blogNote.htmlContent;
                item.description = description.includes('<?xml') ? description.match(/<en-note>(.*)<\/en-note>/)[1] : description;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${response.data.name} - 印象识堂`,
        link: 'https://www.yinxiang.com/everhub/',
        item: items,
    };
};
