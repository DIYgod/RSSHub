const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const username = ctx.params.name;

    const name_response = await got({
        url: `https://curius.app/api/users/${username}`,
        method: 'get',
        headers: {
            Referer: `https://curius.app/${username}`,
        },
    });

    const data = name_response.data;

    const uid = data.user.id;
    const name = `${data.user.firstName} ${data.user.lastName}`;

    const response = await got({
        url: `https://curius.app/api/users/${uid}/links?page=0`,
        method: 'get',
        headers: {
            Referer: `https://curius.app/${username}`,
        },
    });

    const items = response.data.userSaved.map((item) => ({
        title: item.title,
        description: `原文：${item.snippet.substring(0, 100).replace(/\n/gm, '<br/>')}<br/><br/>${item.comments.length > 0 ? `评论：${item.comments[0].text.substring(0, 100)}` : ''}${item.highlights.length > 0 ? `标注：${item.highlights.map((highlight) => (highlight.comment ? `${highlight.text}<br/>评论：${highlight.comment.text}<br/>` : `${highlight.text}<br/>`)).join('')}` : ''}`,
        link: item.url,
        pubDate: parseDate(item.createdDate),
    }));

    ctx.state.data = {
        title: `${name} - Curius`,
        link: `https://curius.app/${username}`,
        description: `${name} - Curius`,
        allowEmpty: true,
        item: items,
    };
};
