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
            limit: 10,
        },
    });

    const data = response.data.data;
    const topic = data[0].topic;
    let link = `https://web.okjike.com/topic/${id}/official`;

    ctx.state.data = {
        title: `${topic.content} - 即刻主题精选`,
        link,
        description: topic.content,
        image: topic.squarePicture.picUrl || topic.squarePicture.middlePicUrl || topic.squarePicture.thumbnailUrl,
        item: data.map((item) => {
            let content = '';

            // 处理正文内容
            content += item.content || item.content.trim() !== '' ? `<div>${item.content}</div><br/> ` : '';

            // 处理缩略图， WEBP + JPEG
            if (item.pictures) {
                item.pictures.forEach(
                    (pic) =>
                        (content += `<picture><source srcset="${pic.picUrl.split('/thumbnail/')[0]}/strip/format/webp" type="image/webp"><source srcset="${pic.picUrl.split('?imageMogr2/')[0]}" type="image/jpeg"><img src="${
                            pic.picUrl.split('?imageMogr2/')[0]
                        }"></picture>`)
                );
            }

            // 处理外链，originalLinkUrl 优先级高于 linkUrl
            if (item.linkInfo && (item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl)) {
                link = item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl;
                content += `<br/> <a href="${link}">查看外链</a>`;
            }

            return {
                // 处理标题，无标题则使用「主题名称」有新消息
                title: item.content.trim() === '' ? `「${topic.content}」有新消息` : item.content,
                description: `${content}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link,
            };
        }),
    };
};
