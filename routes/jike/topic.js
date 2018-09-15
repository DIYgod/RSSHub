const axios = require('../../utils/axios');

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
            let content = item.content;
            let link = `https://web.okjike.com/message-detail/${item.id}/officialMessage`;
            if (item.linkInfo && (item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl)) {
                const source = item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl;
                content = `<a href="${source}">${item.content}</a> - <a href="${link}">即刻</a>`;
                link = source;
            }

            if (item.pictures) {
                item.pictures.forEach((item) => {
                    content += `<br><img referrerpolicy="no-referrer" src="${item.picUrl}">`;
                });
            }
            return {
                title: item.content,
                description: content,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: link,
            };
        }),
    };
};
