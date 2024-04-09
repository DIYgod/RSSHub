const { getNotes, formatText, formatNote } = require('./util');

module.exports = async (ctx) => {
    const userId = ctx.params.user_id;
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;

    const { user, notes } = await getNotes(url, ctx.cache);

    ctx.state.data = {
        title: `${user.nickname} - 笔记 • 小红书 / RED`,
        description: formatText(user.desc),
        image: user.imageb || user.images,
        link: url,
        item: notes.map((item) => formatNote(url, item)),
    };
};
