const axios = require('axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'post',
        url: 'https://app.jike.ruguoapp.com/1.0/personalUpdate/single',
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://web.okjike.com/user/${id}/post`,
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
                'REPOST': '转发',
                'ANSWER': '回答'
            };

            const linkMap = {
                'OFFICIAL_MESSAGE': `https://web.okjike.com/message-detail/${item.id}/officialMessage`,
                'ORIGINAL_POST': `https://web.okjike.com/post-detail/${item.id}/originalPost`,
                'REPOST': `https://web.okjike.com/post-detail/${item.id}/repost`
            };

            let linkTemplate = '';
            if (item.linkInfo && item.linkInfo.linkUrl) {
                linkTemplate = `<a href="${item.linkInfo.linkUrl}">${item.linkInfo.title}</a><br>`;
            }

            let imgTemplate = '';
            item.pictures && item.pictures.forEach((item) => {
                imgTemplate += `<img referrerpolicy="no-referrer" src="${item.picUrl}"><br>`;
            });

            let content = item.content || item.linkInfo && item.linkInfo.title || item.question && item.question.title || '';

            let shortenTitle = '一条动态';
            if (content) {
                shortenTitle = content.length > 75 ? `${content.substr(0, 75)}...` : content;
                content = `${content}<br><br>`;
            }

            if (item.type === 'REPOST') {
                const screenNameTemplate = item.target.user ? `<a href="https://web.okjike.com/user/${item.target.user.username}/post" target="_blank">@${item.target.user.screenName}</a>`: '';

                let repostImgTemplate = '';
                item.target.pictures && item.target.pictures.forEach((item) => {
                    repostImgTemplate += `<br><img referrerpolicy="no-referrer" src="${item.thumbnailUrl}">`;
                });

                let repostContent = `转发 ${screenNameTemplate}: ${item.target.content}${repostImgTemplate}`;
                content = `${content}${repostContent}`.replace(/\n|\r/g, '<br>');
            }

            return {
                title: `${typeMap[item.type]}了: ${shortenTitle}`,
                description: `${content}${linkTemplate}${imgTemplate}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `${linkMap[item.type]}`
            }
        }),
    };
};
