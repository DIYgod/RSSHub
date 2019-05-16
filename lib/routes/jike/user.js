const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'post',
        url: 'https://app.jike.ruguoapp.com/1.0/personalUpdate/single',
        headers: {
            Referer: `https://web.okjike.com/user/${id}/post`,
            'App-Version': '4.12.0',
            platform: 'web',
        },
        data: {
            limit: 20,
            loadMoreKey: null,
            username: id,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `${data[0].user.screenName}的即刻动态`,
        link: `https://web.okjike.com/user/${id}`,
        image: data[0].user.avatarImage.picUrl,
        item: data.map((item) => {
            const typeMap = {
                ORIGINAL_POST: '发布',
                REPOST: '转发',
                ANSWER: '回答',
                QUESTION: '提问',
                PERSONAL_UPDATE: '创建新主题',
            };

            const linkMap = {
                OFFICIAL_MESSAGE: `https://web.okjike.com/message-detail/${item.id}/officialMessage`,
                ORIGINAL_POST: `https://web.okjike.com/post-detail/${item.id}/originalPost`,
                REPOST: `https://web.okjike.com/post-detail/${item.id}/repost`,
                ANSWER: `https://m.okjike.com/answers/${item.id}`,
                QUESTION: `https://m.okjike.com/questions/${item.id}`,
                PERSONAL_UPDATE: `https://web.okjike.com/topic/${item.topic && item.topic.id}/official`,
            };

            let linkTemplate = '';
            if (item.linkInfo && item.linkInfo.linkUrl) {
                linkTemplate = `<a href="${item.linkInfo.linkUrl}">${item.linkInfo.title}</a><br>`;
            }

            let imgTemplate = '';
            item.pictures &&
                item.pictures.forEach((item) => {
                    imgTemplate += `<img referrerpolicy="no-referrer" src="${item.picUrl}"><br>`;
                });

            let content = item.content || (item.linkInfo && item.linkInfo.title) || (item.question && item.question.title) || item.title || '';

            let shortenTitle = '一条动态';
            if (content) {
                shortenTitle = content.length > 75 ? `${content.substr(0, 75)}...` : content;
                content = `${content}<br><br>`;
            }

            if (item.type === 'REPOST') {
                const screenNameTemplate = item.target.user ? `<a href="https://web.okjike.com/user/${item.target.user.username}/post" target="_blank">@${item.target.user.screenName}</a>` : '';

                let repostImgTemplate = '';
                item.target.pictures &&
                    item.target.pictures.forEach((item) => {
                        repostImgTemplate += `<br><img referrerpolicy="no-referrer" src="${item.thumbnailUrl}">`;
                    });

                const repostContent = `转发 ${screenNameTemplate}: ${item.target.content}${repostImgTemplate}`;
                content = `${content}${repostContent}`.replace(/\n|\r/g, '<br>');
            } else if (item.type === 'ANSWER') {
                let answerTextTemplate = '';
                let answerImgTemplate = '';
                let answerImgKeys = [];
                item.richtextContent.blocks &&
                    item.richtextContent.blocks.forEach((item) => {
                        if (item.entityRanges.length && item.text === '[图片]') {
                            answerImgKeys = [...answerImgKeys, ...Object.keys(item.entityRanges)];
                        } else {
                            answerTextTemplate += item.text;
                        }
                    });

                if (answerImgKeys.length) {
                    answerImgKeys.forEach((key) => {
                        const entity = item.richtextContent.entityMap[key];
                        if (entity.type.toUpperCase() === 'IMAGE') {
                            answerImgTemplate += `<br><img referrerpolicy="no-referrer" src="${entity.data.pictureUrl.middlePicUrl}">`;
                        }
                    });
                }
                const answerContent = `回答: ${answerTextTemplate}${answerImgTemplate}`;
                content = `${content}${answerContent}`.replace(/\n|\r/g, '<br>');
            } else if (item.type === 'QUESTION') {
                content = `在主题 <a href="https://web.okjike.com/topic/${item.topic.id}/official" target="_blank">${item.topic.content}</a> 提出了一个问题：<br><br>${content}`;
            } else if (item.type === 'PERSONAL_UPDATE') {
                shortenTitle = item.topic.content;
                content = `<img referrerpolicy="no-referrer" src="${item.topic.squarePicture.picUrl}"> 主题简介：<br>${item.topic.briefIntro.replace(/(?:\r\n|\r|\n)/g, '<br>')}`;
            }

            return {
                title: `${typeMap[item.type]}了: ${shortenTitle}`,
                description: `${content}${linkTemplate}${imgTemplate}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `${linkMap[item.type]}`,
            };
        }),
    };
};
