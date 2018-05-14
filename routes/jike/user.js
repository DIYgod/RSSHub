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

            let linkTemplate = '';
            if (item.linkInfo && item.linkInfo.linkUrl) {
                linkTemplate = `<br><a href="${item.linkInfo.linkUrl}">${item.linkInfo.title}</a>`;
            }

            let imgTemplate = '';
            item.pictures && item.pictures.forEach((item) => {
                imgTemplate += `<br><img referrerpolicy="no-referrer" src="${item.picUrl}">`;
            });

            let content = item.content || item.linkInfo && item.linkInfo.title || item.target && item.target.content || item.question && item.question.title;
            const shortenTitle = content.length > 75 ? `${content.substr(0, 75)}...` : content;

            if (item.type === 'REPOST') {
                const targetLinkMap = {
                    'OFFICIAL_MESSAGE': `https://web.okjike.com/message-detail/${item.target.id}/officialMessage`,
                    'ORIGINAL_POST': `https://web.okjike.com/post-detail/${item.target.id}/originalPost`,
                    'REPOST': `https://web.okjike.com/post-detail/${item.target.id}/repost`
                };

                const screenNameTemplate = item.target.user ? `<p>@${item.target.user.screenName}</p>` : '';

                let repostImgTemplate = '';
                item.target.pictures && item.target.pictures.forEach((item) => {
                    repostImgTemplate += `<p><img style="box-shadow: 0 0 1px rgba(0,0,0,.2);" referrerpolicy="no-referrer" src="${item.thumbnailUrl}"></p>`;
                });

                let repostContent = `<a style="padding:15px;margin-top:10px;display:block;border-radius:4px;background-color:#fff;border:1px solid rgba(0,0,0,.08);text-decoration:none;" href="${targetLinkMap[item.target.type]}" target="_blank">${screenNameTemplate}${item.target.content}${repostImgTemplate}</a>`;
                content = `${content}${repostContent}`;
            }

            return {
                title: `${typeMap[item.type]}了: ${shortenTitle}`,
                description: `${content}${linkTemplate}${imgTemplate}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `https://web.okjike.com/post-detail/${item.id}/originalPost`
            }
        }),
    };
};
