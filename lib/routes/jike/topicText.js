const got = require('@/utils/got');
const dayjs = require('dayjs');
const common = require('./common');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://m.okjike.com/topics/${id}`);

    const html = response.data;
    const $ = cheerio.load(html);
    const raw = $('[type = "application/json"]').html();
    const data = JSON.parse(raw).props.pageProps;

    if (common.emptyResponseCheck(ctx, data)) {
        return;
    }

    const title = data.topic.content;

    ctx.state.data = {
        title: `${title} - 即刻`,
        link: `https://m.okjike.com/topics/${id}`,
        description: `${title} - 即刻`,
        item: data.posts.map((item) => {
            const date = dayjs(item.createdAt);
            return {
                title: `${title} ${date.format('MM月DD日')}`,
                description: item.content.replace(/\n/g, '<br>'),
                pubDate: date.toDate(),
                link: `https://m.okjike.com/originalPosts/${item.id}`,
            };
        }),
    };
};
