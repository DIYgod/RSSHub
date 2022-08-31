const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const baseUrl = 'https://api.feeddd.org';
    const apiUrl = `${baseUrl}/feeds/${id}/json`;

    const response = await got(apiUrl);

    let items = response.data.items.map((item) => ({
        title: item.title,
        // the date is when the article was grabbed, not published, `finishArticleItem` will fix this
        pubDate: parseDate(item.date_modified),
        link: item.url,
        guid: item.id,
    }));

    items = await Promise.all(items.map(async (item) => await finishArticleItem(ctx, item)));

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
