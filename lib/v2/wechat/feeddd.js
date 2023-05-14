const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const baseUrl = 'https://feed.hamibot.com';
    const apiUrl = `${baseUrl}/api/feeds/${id}/json`;

    let response;

    try {
        response = await got(apiUrl);
    } catch (error) {
        if (error.name === 'HTTPError' && error.response.statusCode === 404) {
            throw Error('该公众号不存在，有关如何获取公众号 id，详见 https://docs.rsshub.app/new-media.html#wei-xin-gong-zhong-hao-feeddd-lai-yuan');
        }
        throw error;
    }

    let items = response.data.items.map((item) => ({
        title: item.title,
        // the date is when the article was grabbed, not published, `finishArticleItem` will fix this
        pubDate: parseDate(item.date_modified),
        link: item.url,
        guid: item.id,
    }));

    items = await Promise.all(items.map((item) => finishArticleItem(ctx, item)));

    ctx.state.data = {
        title: response.data.title,
        link: response.data.feed_url,
        description: response.data.title,
        item: items,
        allowEmpty: true,
    };

    ctx.state.json = {
        title: response.data.title,
        link: response.data.feed_url,
        image: 'https://mp.weixin.qq.com/favicon.ico',
        description: response.data.title,
        item: items,
    };
};
