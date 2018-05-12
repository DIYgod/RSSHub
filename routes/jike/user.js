const axios = require('axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'post',
        url: 'https://app.jike.ruguoapp.com/1.0/personalUpdate/single',
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://web.okjike.com/user/${id}`,
            'App-Version': '4.1.0',
            'platform': 'web'
        },
        data: {
            limit: 20,
            loadMoreKey: null,
            username: id
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `${data[0].user.screenName}的即刻动态`,
        link: `https://web.okjike.com/user/${id}`,
        image: data[0].user.avatarImage.picUrl,
        item: data.map((item) => {
            const typeMap = {
                'ORIGINAL_POST': '发布',
                'REPOST': '转发'
            };

            let linkTemplate = '';
            if (item.linkInfo && item.linkInfo.linkUrl) {
                linkTemplate = `<br><a href="${item.linkInfo.linkUrl}">${item.linkInfo.title}</a>`;
            }

            let imgTemplate = '';
            item.pictures && item.pictures.forEach((item) => {
                imgTemplate += `<br><img referrerpolicy="no-referrer" src="${item.picUrl}">`;
            });

            const content = item.content || item.linkInfo && item.linkInfo.title || item.target && item.target.content;
            return {
                title: `${typeMap[item.type]}了: ${content}`,
                description: `${content}${linkTemplate}${imgTemplate}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `https://web.okjike.com/message-detail/${item.id}/officialMessage`
            }
        }),
    };
};