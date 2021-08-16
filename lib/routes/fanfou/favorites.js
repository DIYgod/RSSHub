const config = require('@/config').value;
const utils = require('./utils');

module.exports = async (ctx) => {
    if (!config.fanfou || !config.fanfou.consumer_key || !config.fanfou.consumer_secret || !config.fanfou.username || !config.fanfou.password) {
        throw 'Fanfou RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const uid = ctx.params.uid;
    const fanfou = await utils.getFanfou();
    const timeline = await fanfou.get(`/favorites/${encodeURIComponent(uid)}`, { id: uid, mode: 'lite', format: 'html' });

    const result = timeline.map((item) => {
        let img_html = '';
        if (item.photo) {
            img_html = `<br/><img src="${item.photo.largeurl}" alt="饭否动态图片"/>`;
        }
        return {
            title: item.text,
            author: item.user.name,
            description: item.text + img_html,
            pubDate: item.created_at,
            link: `https://fanfou.com/statuses/${item.id}`,
        };
    });

    const users = await fanfou.get(`/users/show`, { id: uid });
    const authorName = users.screen_name;

    ctx.state.data = {
        title: `${authorName}的饭否收藏`,
        link: `https://fanfou.com/favorites/${encodeURIComponent(uid)}`,
        description: `${authorName}的饭否收藏`,
        item: result,
    };
};
