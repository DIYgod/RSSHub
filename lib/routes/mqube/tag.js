const got = require('@/utils/got');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;

    const url = `https://mqube.net/search/tag/${encodeURIComponent(tag)}`;

    const response = await got.get(url);

    const list = JSON.parse(response.data.match(/gon.item_list=(.*?);/)[1]) || [];

    ctx.state.data = {
        title: `MQube - ${tag}`,
        link: url,
        item: list.map((item) => ({
            title: item.title,
            author: item.user.name,
            description: `<audio src="https://s3.mqube.net/t/files/item/file/${item.code.toString().substring(0, 6)}/${item.code}/${item.file}" controls loop></audio><div><br>${item.description.replace(/\n/g, '<br>')}</dive>`,
            pubDate: new Date(item.created_at),
            link: `https://mqube.net/play/${item.code}`,
        })),
    };
};
