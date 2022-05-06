const got = require('@/utils/got');

const load = async (link, configs) => ({
    description: (await got.get(link, configs)).data.article.content,
});

const ProcessFeed = (list, host, caches) => {
    const configs = { headers: { Referer: host } };

    return Promise.all(
        list.map(async (item) => {
            const itemUrl = `https://api.sosreader.com/api/article/${item._id}`;

            const single = {
                title: item.title,
                author: item.user.fullname,
                pubDate: new Date(item.updatedAt).toUTCString(),
                link: `${host}/${item._id}`,
            };

            const other = await caches.tryGet(itemUrl, () => load(itemUrl, configs));
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};
