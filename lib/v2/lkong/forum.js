const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const { viewForum, viewThread } = require('./query');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '8';
    const digest = ctx.params.digest;

    const rootUrl = 'https://www.lkong.com';
    const apiUrl = 'https://api.lkong.com/api';
    const currentUrl = `${rootUrl}/forum/${id}`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: viewForum(id),
    });

    let items = response.data.data[digest ? 'hots' : 'threads'].map((item) => ({
        guid: item.tid,
        title: item.title,
        link: `${rootUrl}/thread/${item.tid}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: apiUrl,
                    json: viewThread(item.guid, 1),
                });

                item.author = detailResponse.data.data.thread?.author.name;
                item.pubDate = parseDate(detailResponse.data.data.thread?.dateline);
                item.description = art(path.join(__dirname, 'templates/content.art'), {
                    content: JSON.parse(detailResponse.data.data.posts[0].content),
                });
                delete item.guid;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${response.data.data.forum.name} - 龙空`,
        link: currentUrl,
        item: items,
        description: response.data.data.forumCount.info,
    };
};
