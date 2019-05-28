const axios = require('@/utils/axios');

function getContentByActivity(status) {
    let description = '';
    let title = '';
    switch (status.activity) {
        case '说':
            title = `${status.author.name} ${status.activity}:${status.text}`;
            description = status.text;
            status.images.forEach((image) => {
                description += `<p><img referrerpolicy="no-referrer" src="${image.normal.url}"/></p>`;
            });
            break;
        case '转发':
            description = getContentByActivity(status.reshared_status).title;
            title = `${status.author.name} ${status.activity} ${status.reshared_status.author.name} 的广播：${status.reshared_status.text}`;
            break;
        default:
            if (status.card) {
                if (status.card.rating) {
                    description = `《${status.card.title}》<br>评分：${status.card.rating}<br>${status.card.subtitle}`;
                    title = `${status.author.name} ${status.activity}:《${status.card.title}》${status.text}`;
                } else {
                    description = `${status.card.title}<br>${status.card.subtitle}`;
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

    const response = await axios({
        method: 'GET',
        url: url,
        headers: {
            Referer: `https://m.douban.com/people/${userid}/statuses`,
        },
    });
    const items = response.data.items;

    ctx.state.data = {
        title: `豆瓣广播-${userid}`,
        link: `https://m.douban.com/people/${userid}/statuses`,
        item: items.map((item) => {
            const r = getContentByActivity(item.status);
            return {
                title: r.title,
                link: item.status.sharing_url,
                pubDate: item.status.create_time,
                description: r.description,
            };
        }),
    };
};
