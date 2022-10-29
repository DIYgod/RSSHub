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
        description: `原文：${item.metadata.full_text.replace(/\n/gm, '<br/>')}${item.comments.length > 0 ? `<br/><br/>评论：${item.comments[0].text.substring(0, 100)}</br>` : ''}${item.highlights.length > 0 ? `<br/>标注：${item.highlights.map((highlight) => (highlight.comment ? `${highlight.highlight}<br/>评论：${highlight.comment.text}<br/>` : `<br/>标注：${highlight.highlight}<br/>`)).join('')}` : ''}`,
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
