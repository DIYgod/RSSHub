const axios = require('../../utils/axios');
const common = require('./common');

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
            limit: 10,
        },
    });

    const data = response.data.data;

    if (common.emptyResponseCheck(ctx, data)) {
        return;
    }

    const topic = data[0].topic;
    ctx.state.data = {
        title: `${topic.content} - 即刻主题精选`,
        link: `https://web.okjike.com/topic/${id}/official`,
        description: topic.content,
        image: topic.squarePicture.picUrl || topic.squarePicture.middlePicUrl || topic.squarePicture.thumbnailUrl,
        item: common.topicDataHanding(data),
    };
};
