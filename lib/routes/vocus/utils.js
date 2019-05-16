const axios = require('@/utils/axios');

const load = async (id, headers) => ({
    description: (await axios.get(`https://api.sosreader.com/api/article/${id}`, headers)).data.article.content,
});

const ProcessFeed = async (list, host, caches) => {
    const headers = { Referer: host };

    return await Promise.all(
        list.map(async (item) => {
            const itemUrl = `https://api.sosreader.com/api/article/${item._id}`;

            const single = {
                title: item.title,
                author: item.user.fullname,
                pubDate: new Date(item.updatedAt).toUTCString(),
                link: `${host}/${item._id}`,
            };

            const other = await caches.tryGet(itemUrl, single, async () => await load(itemUrl, headers));
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};
