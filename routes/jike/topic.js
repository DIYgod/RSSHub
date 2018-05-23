const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'post',
        url: 'https://app.jike.ruguoapp.com/1.0/messages/history',
        headers: {
            'User-Agent': config.ua,
            Referer: `https://m.okjike.com/topics/${id}`,
            'App-Version': '4.1.0',
        },
        data: {
            loadMoreKey: null,
            topic: id,
            limit: 20,
        },
    });

    const data = response.data.data;
    const topic = data[0].topic;

    ctx.state.data = {
        title: `${topic.content} - 即刻主题精选`,
        link: `https://web.okjike.com/topic/${id}/official`,
        description: topic.content,
        image: topic.squarePicture.picUrl || topic.squarePicture.middlePicUrl || topic.squarePicture.thumbnailUrl,
        item: data.map((item) => {
            let contentTemplate = item.content;
            if (item.linkInfo && (item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl)) {
                contentTemplate = `<a href="${item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl}">${item.content}</a>`;
            }

            let imgTemplate = '';
            item.pictures &&
                item.pictures.forEach((item) => {
                    imgTemplate += `<br><img referrerpolicy="no-referrer" src="${item.picUrl}">`;
                });

            return {
                title: item.content,
                description: `${contentTemplate}${imgTemplate}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `https://web.okjike.com/message-detail/${item.id}/officialMessage`,
            };
        }),
    };
};
