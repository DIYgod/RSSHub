const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const parseContent = (content) =>
    art(path.join(__dirname, 'templates/description.art'), {
        content,
    });

art.defaults.imports.parseContent = parseContent;

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://analy.zhubai.wiki';
    const apiRootUrl = 'https://open.zhubai.wiki';
    const apiUrl = `${apiRootUrl}/a/zb/s/ht/pl/wk`;

    const response = await got({
        method: 'post',
        url: apiUrl,
    });

    let items = response.data.data.slice(0, limit).map((item) => ({
        link: item.fp ?? item.pq ?? item.pu,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const matches = item.link.match(/\/(fp|pq|pu)\/([\w-]+)\/(\d+)/);

                const detailResponse = await got({
                    method: 'get',
                    url: `https://${matches[2]}.zhubai.love/api/posts/${matches[3]}`,
                });

                const data = detailResponse.data;

                item.title = data.title;
                item.author = data.author.name;
                item.pubDate = parseDate(data.created_at);
                item.description = parseContent(JSON.parse(data.content));
                item.link = `https://${matches[2]}.zhubai.love/posts/${matches[3]}`;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '竹白 - TOP20',
        link: rootUrl,
        item: items,
    };
};
