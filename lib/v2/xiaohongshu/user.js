const { getUser } = require('./util');

module.exports = async (ctx) => {
    const userId = ctx.params.user_id;
    const category = ctx.params.category;
    const url = `https://www.xiaohongshu.com/user/profile/${userId}`;

    const content = await getUser(url, ctx.cache);

    const { otherInfo, user_posted, collect } = content;
    const title = `${otherInfo.data.basic_info.nickname} - ${category === 'notes' ? '笔记' : '收藏'} • 小红书 / RED`;
    const description = otherInfo.data.basic_info.desc;
    const image = otherInfo.data.basic_info.imageb || otherInfo.data.basic_info.images;

    const items = (category, user_posted, collect) =>
        (category === 'notes' ? user_posted : collect).data.notes.map((item) => ({
            title: item.display_title,
            link: `${url}/${item.note_id}`,
            description: `<img src ="${item.cover.url}"><br>${item.display_title}`,
            author: item.user.nickname,
        }));

    ctx.state.data = {
        title,
        description,
        image,
        link: url,
        item: items(category, user_posted, collect),
    };
};
