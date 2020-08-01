const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/members/${id}/activities?limit=7`,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/people/${id}/activities`,
            Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `${data[0].actor.name}的知乎动态`,
        link: `https://www.zhihu.com/people/${id}/activities`,
        description: data[0].actor.headline || data[0].actor.description,
        item:
            data &&
            data.map((item) => {
                const detail = item.target;
                let title;
                let description;
                let url;
                const images = [];
                let text = '';
                let link = '';
                let author = '';

                switch (item.target.type) {
                    case 'answer':
                        title = detail.question.title;
                        author = detail.author.name;
                        description = utils.ProcessImage(detail.content);
                        url = `https://www.zhihu.com/question/${detail.question.id}/answer/${detail.id}`;
                        break;
                    case 'article':
                        title = detail.title;
                        author = detail.author.name;
                        description = utils.ProcessImage(detail.content);
                        url = `https://zhuanlan.zhihu.com/p/${detail.id}`;
                        break;
                    case 'pin':
                        title = detail.excerpt_title;
                        author = detail.author.name;
                        detail.content.forEach((contentItem) => {
                            if (contentItem.type === 'text') {
                                text = `<p>${contentItem.own_text}</p>`;
                            } else if (contentItem.type === 'image') {
                                images.push(`<p><img src="${contentItem.url.replace('xl', 'r')}"/></p>`);
                            } else if (contentItem.type === 'link') {
                                link = `<p><a href="${contentItem.url}" target="_blank">${contentItem.title}</a></p>`;
                            } else if (contentItem.type === 'video') {
                                link = `<p><video
                                controls="controls"
                                width="${contentItem.playlist[1].width}"
                                height="${contentItem.playlist[1].height}"
                                src="${contentItem.playlist[1].url}"></video></p>`;
                            }
                        });
                        description = `${text}${link}${images.join('')}`;
                        url = `https://www.zhihu.com/pin/${detail.id}`;
                        break;
                    case 'question':
                        title = detail.title;
                        author = detail.author.name;
                        description = utils.ProcessImage(detail.detail);
                        url = `https://www.zhihu.com/question/${detail.id}`;
                        break;
                    case 'collection':
                        title = detail.title;
                        url = `https://www.zhihu.com/collection/${detail.id}`;
                        break;
                    case 'column':
                        title = detail.title;
                        description = `<p>${detail.intro}</p><p><img src="${detail.image_url}"/></p>`;
                        url = `https://zhuanlan.zhihu.com/${detail.id}`;
                        break;
                    case 'topic':
                        title = detail.name;
                        description = `<p>${detail.introduction}</p><p>话题关注者人数：${detail.followers_count}</p>`;
                        url = `https://www.zhihu.com/topic/${detail.id}`;
                        break;
                    case 'live':
                        title = detail.subject;
                        description = detail.description.replace(/\n|\r/g, '<br>');
                        url = `https://www.zhihu.com/lives/${detail.id}`;
                        break;
                    case 'roundtable':
                        title = detail.name;
                        description = detail.description;
                        url = `https://www.zhihu.com/roundtable/${detail.id}`;
                        break;
                }

                return {
                    title: `${data[0].actor.name}${item.action_text}: ${title}`,
                    author: author,
                    description: description,
                    pubDate: new Date(item.created_time * 1000).toUTCString(),
                    link: url,
                };
            }),
    };
};
