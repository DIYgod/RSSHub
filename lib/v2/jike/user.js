const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://m.okjike.com/users/${id}`,
        headers: {
            Referer: `https://m.okjike.com/users/${id}`,
        },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const raw = $('[type = "application/json"]').html();
    const data = JSON.parse(raw).props.pageProps;

    const getLink = (id, type) => {
        switch (type) {
            case 'REPOST':
                return `https://m.okjike.com/reposts/${id}`;
            case 'MEDIUM':
                return `https://www.okjike.com/medium/${id}`;
            default:
                return `https://m.okjike.com/originalPosts/${id}`;
        }
    };

    const items = await Promise.all(
        data.posts.map(async (item) => {
            const typeMap = {
                ORIGINAL_POST: '发布',
                REPOST: '转发',
                ANSWER: '回答',
                QUESTION: '提问',
                PERSONAL_UPDATE: '创建新主题',
            };

            let linkTemplate = '';
            if (item.linkInfo && item.linkInfo.linkUrl) {
                linkTemplate = `<a href="${item.linkInfo.linkUrl}">${item.linkInfo.title}</a><br>`;
            }

            let imgTemplate = '';
            item.pictures &&
                item.pictures.forEach((item) => {
                    imgTemplate += `<img src="${item.picUrl}"><br>`;
                });

            let content = item.content || (item.linkInfo && item.linkInfo.title) || (item.question && item.question.title) || item.title || '';
            content = content.replace(/\r\n|\n|\r/g, '<br>');

            let shortenTitle = '一条动态';
            if (content) {
                shortenTitle = content.replace(/(<br>)+/g, ' ');
                content = `${content}<br><br>`;
            }

            let repostContent;
            if (item.type === 'REPOST') {
                const screenNameTemplate = item.target.user ? `<a href="https://m.okjike.com/users/${item.target.user.username}" target="_blank">@${item.target.user.screenName}</a>` : '';

                let repostImgTemplate = '';
                item.target.pictures &&
                    item.target.pictures.forEach((item) => {
                        repostImgTemplate += `<br><img src="${item.thumbnailUrl}">`;
                    });

                repostContent = `<div class="rsshub-quote">转发 ${screenNameTemplate}: ${item.target.content}${repostImgTemplate}</div>`.replace(/\r\n|\n|\r/g, '<br>');
                content = `${content}${repostContent}`;
            }
            // 部分功能未知
            /* else if (item.type === 'ANSWER') {
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
                        answerImgTemplate += `<br><img src="${entity.data.pictureUrl.middlePicUrl}">`;
                    }
                });
            }
            const answerContent = `回答: ${answerTextTemplate}${answerImgTemplate}`;
            content = `${content}${answerContent}`.replace(/\n|\r/g, '<br>');
        } else if (item.type === 'QUESTION') {
            content = `在主题 <a href="https://web.okjike.com/topic/${item.topic.id}/official" target="_blank">${item.topic.content}</a> 提出了一个问题：<br><br>${content}`;
        } else if (item.type === 'PERSONAL_UPDATE') {
            shortenTitle = item.topic.content;
            content = `<img src="${item.topic.squarePicture.picUrl}"> 主题简介：<br>${item.topic.briefIntro.replace(/(?:\r\n|\r|\n)/g, '<br>')}`;
        }*/

            const single = {
                title: `${typeMap[item.type]}了: ${shortenTitle}`,
                description: `${content}${linkTemplate}${imgTemplate}`.replace(/(<br>|\s)+$/, ''),
                pubDate: parseDate(item.createdAt),
                link: getLink(item.id, item.type),
                _extra: repostContent && {
                    quote: {
                        url: getLink(item.target.id, item.target.type),
                        content_html: repostContent,
                    },
                },
            };

            if (id === 'wenhao1996' && item.topic.id === '553870e8e4b0cafb0a1bef68') {
                single.link = item.urlsInText[0].url;

                const data = (
                    await got({
                        method: 'get',
                        url: single.link,
                        headers: {
                            Referer: `https://m.okjike.com/users/${id}`,
                        },
                    })
                ).data;
                const $$ = cheerio.load(data);
                $$('span.num,span.arrow').remove();

                single.title = `一觉醒来世界发生了什么 ${$$('title').text()}`;

                single.description = '';
                $$('div.container')
                    .find('li.item')
                    // eslint-disable-next-line array-callback-return
                    .map((i, j) => {
                        single.description += `<a href="${$$(j).find('a').attr('href')}">${$$(j).find('a').text()}</a><br>`;
                    });
            }

            return single;
        })
    );

    ctx.state.data = {
        title: `${data.user.screenName}的即刻动态`,
        description: data.user.bio,
        link: `https://m.okjike.com/users/${id}`,
        image: data.user.avatarImage.picUrl,
        item: items,
    };
};
