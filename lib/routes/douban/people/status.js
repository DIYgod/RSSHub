const got = require('@/utils/got');

function getContentByActivity(status) {
    let description = '';
    let title = '';
    switch (status.activity) {
        case '说':
            title = `${status.author.name} ${status.activity}:${status.text}`;
            description = status.text;
            status.images.forEach((image) => {
                description += `<p><img src="${image.normal.url}"/></p>`;
            });
            break;
        case '转发':
            description = `${status.text}<br>`;
            if (status.reshared_status.deleted) {
                title = `${status.author.name} ${status.activity} 广播：原动态已被发布者删除`;
                description += `原动态已被发布者删除`;
            } else {
                description += getContentByActivity(status.reshared_status).title;
                title = `${status.author.name} ${status.activity} ${status.reshared_status.author.name} 的广播：${status.reshared_status.text}`;
                status.reshared_status.images.forEach((image) => {
                    description += `<p><img src="${image.normal.url}"/></p>`;
                });
            }

            break;
        default:
            if (status.card) {
                let image;
                if (status.card.image && (status.card.image.large || status.card.image.normal)) {
                    image = (status.card.image.large || status.card.image.normal).url;
                }
                if (status.card.rating) {
                    description = `${status.text ? `${status.author.name}的评分：${status.text}<br>` : ''}豆瓣评分：${status.card.rating}<br>${status.card.subtitle}${image ? `<br><img src="${image}">` : ''}`;
                    title = `${status.author.name}${status.activity}:《${status.card.title}》`;
                } else {
                    description = `${status.card.title}<br>${status.card.subtitle}${image ? `<br><img src="${image}">` : ''}`;
                    title = `${status.author.name} ${status.activity}:「${status.card.title}」${status.text}`;
                }
            }
            break;
    }
    return { title, description };
}

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `https://m.douban.com/rexxar/api/v2/status/user_timeline/${userid}?max_id=&ck=eUUA&for_mobile=1`;

    const response = await got({
        method: 'GET',
        url: url,
        headers: {
            Referer: `https://m.douban.com/people/${userid}/statuses`,
        },
    });

    const items = response.data.items;

    const username = items ? items[0].status.author.name : '';

    ctx.state.data = {
        title: `豆瓣广播 - ${username ? username : userid}`,
        link: `https://m.douban.com/people/${userid}/statuses`,
        item:
            items &&
            items
                .filter((item) => !item.deleted)
                .map((item) => {
                    const r = getContentByActivity(item.status);
                    return {
                        title: r.title,
                        link: item.status.sharing_url,
                        pubDate: new Date(Date.parse(item.status.create_time + ' GMT+0800')).toUTCString(),
                        description: r.description,
                    };
                }),
    };
};
