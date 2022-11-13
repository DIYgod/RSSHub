const path = require('node:path');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const renderDescription = (description) => art(path.join(__dirname, 'templates/description.art'), description);

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const response = await got({
        method: 'get',
        url: `https://music.163.com/api/event/get/${id}`,
        headers: {
            Referer: 'https://music.163.com/',
        },
    });

    const { data } = response;
    const { nickname } = data.events[0].user;

    ctx.state.data = {
        title: `${nickname}的云村动态`,
        link: `https://music.163.com/#/user/event?id=${id}`,
        description: `网易云音乐用户动态 - ${nickname}`,
        item: data.events.map((item) => {
            const title = item.info.commentThread.resourceTitle,
                userId = item.user.userId,
                description = JSON.parse(item.json).msg,
                eventId = item.id;
            return {
                title,
                description: renderDescription({ description }),
                link: `https://music.163.com/#/event?id=${eventId}&uid=${userId}`,
                pubDate: new Date(item.eventTime),
                published: new Date(item.eventTime),
                author: nickname,
                upvotes: item.info.likedCount,
                comments: item.info.commentCount,
            };
        }),
    };
};
