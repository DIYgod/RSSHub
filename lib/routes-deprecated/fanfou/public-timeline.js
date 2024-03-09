const config = require('@/config').value;
const utils = require('./utils');

module.exports = async (ctx) => {
    if (!config.fanfou || !config.fanfou.consumer_key || !config.fanfou.consumer_secret || !config.fanfou.username || !config.fanfou.password) {
        throw new Error('Fanfou RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const keyword = ctx.params.keyword;
    const fanfou = await utils.getFanfou();
    const timeline = await fanfou.get('/search/public_timeline', { q: keyword, mode: 'lite', format: 'html' });

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

    ctx.state.data = {
        title: `饭否搜索-${keyword}`,
        link: `https://fanfou.com/q/${keyword}`,
        description: `饭否搜索-${keyword}`,
        item: result,
    };
};
