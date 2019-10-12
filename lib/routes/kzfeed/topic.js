const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const info_res = await got({
        method: 'post',
        url: 'https://kz.sync163.com/api/topic/info',
        headers: {
            from: 'h5',
            token: 'asdfasdfasdf',
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            topic_id: id,
        }),
    });
    const info = info_res.data;

    const cards_res = await got({
        method: 'post',
        url: 'https://kz.sync163.com/api/topic/cards',
        headers: {
            from: 'h5',
            token: 'asdfasdfasdf',
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            topic_id: id,
        }),
    });
    const list = cards_res.data.list;

    ctx.state.data = {
        title: `快知 - ${info.info.name}`,
        description: info.info.description,
        link: `https://kz.sync163.com/web/topic/${id}`,
        image: info.info.icon,
        item: list.map((item) => ({
            title: item.title ? item.title : item.url_title,
            description: `<p style="white-space: pre-line">${item.text}</p><img src="${item.url_cover}" /><p>${item.url_desc}…</p>`,
            pubDate: new Date(item.created_time * 1000),
            link: item.url,
        })),
    };
};
