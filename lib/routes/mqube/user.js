const got = require('@/utils/got');

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const url = `https://mqube.net/user/${user}`;

    const response = await got.get(url);

    const list = JSON.parse(response.data.match(/gon.item_list=(.*?);/)[1]) || [];

    const username = list[0].user.name;

    ctx.state.data = {
        title: `MQube - ${username}`,
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
