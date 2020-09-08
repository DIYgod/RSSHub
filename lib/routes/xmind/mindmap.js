const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = `https://www.xmind.net/_api/share/featured-maps?limit=20&lang=${ctx.params.lang}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const list = response.data.mapList.map((item) => ({
        title: item.topic,
        link: `https://www.xmind.net/${item.id}`,
        description: `<img src="${item.previewUrl}">`,
        pubDate: new Date(item.created).toUTCString(),
        author: item.profileName,
    }));

    ctx.state.data = {
        title: 'Mindmap Gallery - XMind',
        link: 'https://www.xmind.net/share',
        item: list,
    };
};
