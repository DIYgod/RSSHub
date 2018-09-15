const axios = require('../../utils/axios');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'post',
        url: 'https://app.jike.ruguoapp.com/1.0/messages/history',
        headers: {
            Referer: `https://m.okjike.com/topics/${id}`,
            'App-Version': '4.1.0',
        },
        data: {
            loadMoreKey: null,
            topic: id,
            limit: 5,
        },
    });

    const data = response.data.data;
    const title = data[0].topic.content;

    ctx.state.data = {
        title: `${title} - 即刻`,
        link: `https://web.okjike.com/topic/${id}/official`,
        description: `${title} - 即刻`,
        item: data.map((item) => {
            const date = new Date(item.createdAt);
            return {
                title: `${title} ${dayjs(date).format('YYYY MMM DD')}`,
                description: item.content.replace(new RegExp('\n', 'g'), '<br />'),
                pubDate: date.toUTCString(),
                link: `https://web.okjike.com/message-detail/${item.id}/officialMessage`,
            };
        }),
    };
};
