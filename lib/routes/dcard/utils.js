const axios = require('../../utils/axios');

module.exports = {
    ProcessFeed: async (list, cache) => {
        const result = await Promise.all(
            list.map(async (item) => {
                const link = `https://www.dcard.tw/f/funny/p/${item.id}-${encodeURIComponent(item.title)}`;

                const content = await cache.tryGet(`dcard${item.id}`, async () => {
                    const response = await axios({
                        method: 'get',
                        url: `https://www.dcard.tw/_api/posts/${item.id}`,
                        headers: {
                            Referer: link,
                        },
                    });
                    return response.data.content.replace(/(https?:\/\/i\.imgur\.com\/(.*?)\.(jpg|png))/g, (match, p1) => `<img src="${p1}">`).replace(/(\r\n|\r|\n)+/g, '<br>');
                });

                const single = {
                    title: item.title,
                    link: link,
                    description: content,
                    author: item.school || '匿名',
                    guid: item.id,
                };

                return Promise.resolve(single);
            })
        );

        return result;
    },
};
