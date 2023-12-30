const config = require('@/config').value;
const utils = require('./utils');

module.exports = async (ctx) => {
    if (!config.fanfou || !config.fanfou.consumer_key || !config.fanfou.consumer_secret || !config.fanfou.username || !config.fanfou.password) {
        throw 'Fanfou RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const uid = ctx.params.uid;
    const fanfou = await utils.getFanfou();
    const timeline = await fanfou.get('/statuses/user_timeline', { id: uid, mode: 'lite', format: 'html' });

    const result = timeline.map((item) => {
        let img_html = '';
        if (item.photo) {
            img_html = `<br/><img src="${item.photo.originurl}" alt="饭否动态图片"/>`;
        }
        return {
            title: item.plain_text,
            author: item.user.name,
            description: item.text + img_html,
            pubDate: item.created_at,
            link: `https://fanfou.com/statuses/${item.id}`,
        };
    });

    const authorName = result[0].author;

    ctx.state.data = {
        title: `${authorName}的饭否`,
        link: `https://fanfou.com/${uid}`,
        description: `${authorName}的饭否`,
        item: result,
    };
};
