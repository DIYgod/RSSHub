const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://forum.obsidian.md';
    const currentUrl = `${rootUrl}/c/announcements/13.json?page=0`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = response.data.topic_list.topics.map((item) => ({
        title: item.title,
        link: `${rootUrl}/t/${item.slug}/${item.id}`,
        pubDate: new Date(item.created_at).toUTCString(),
    }));

    ctx.state.data = {
        title: 'Announcements - Obsidian',
        link: `${rootUrl}/c/announcements/13`,
        item: items,
    };
};
