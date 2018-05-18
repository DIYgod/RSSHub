const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://app.jike.ruguoapp.com/1.0/messages/showDetail?topicId=${id}`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://m.okjike.com/topics/${id}`,
            'App-Version': '3.5.0',
        },
    });

    const data = response.data;

    ctx.state.data = {
        title: data.topic.content,
        link: `https://web.okjike.com/topic/${id}/official`,
        description: data.topic.briefIntro,
        image: data.topic.pictureUrl,
        item: data.messages.map((item) => {
            let contentTemplate = item.content;
            if (item.linkUrl) {
                contentTemplate = `<a href="${item.linkUrl}">${item.content}</a>`;
            }
            if (item.personalUpdate && item.personalUpdate.linkUrl) {
                contentTemplate = `<a href="${item.personalUpdate.linkUrl}">${item.content}</a>`;
            }

            let imgTemplate = '';
            item.pictureUrls &&
                item.pictureUrls.forEach((item) => {
                    imgTemplate += `<br><img referrerpolicy="no-referrer" src="${item.picUrl}">`;
                });
            item.personalUpdate &&
                item.personalUpdate.pictureUrls &&
                item.personalUpdate.pictureUrls.forEach((item) => {
                    imgTemplate += `<br><img referrerpolicy="no-referrer" src="${item.picUrl}">`;
                });

            let videoTemplate = '';
            if (item.video) {
                videoTemplate = `<br>视频: <img referrerpolicy="no-referrer" src="${item.video.image.picUrl}">`;
            }
            if (item.personalUpdate && item.personalUpdate.video) {
                videoTemplate = `<br>视频: <img referrerpolicy="no-referrer" src="${item.personalUpdate.video.image.picUrl}">`;
            }
            return {
                title: item.content,
                description: `${contentTemplate}${imgTemplate}${videoTemplate}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `https://web.okjike.com/message-detail/${item.id}/officialMessage`,
            };
        }),
    };
};
