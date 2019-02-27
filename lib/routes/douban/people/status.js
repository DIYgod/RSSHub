const axios = require('../../../utils/axios');

function getContentByActivity(status) {
    const title = `${status.author.name} ${status.activity}:${status.text}`;
    let description = '';
    switch (status.activity) {
        case '说':
            break;
        case '转发':
            description = getContentByActivity(status.reshared_status).title;
            break;
        default:
            if (status.card) {
                if (status.card.rating) {
                    description = `${status.card.title}<br>评分：${status.card.rating}<br>${status.card.subtitle}`;
                } else {
                    description = `${status.card.title}<br>${status.card.subtitle}`;
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
