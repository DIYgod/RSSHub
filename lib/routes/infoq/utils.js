const got = require('@/utils/got');

const ProcessFeed = async (list, cache) => {
    const detailUrl = 'https://www.infoq.cn/public/v1/article/getDetail';

    const items = await Promise.all(
        list.map(async (e) => {
            const uuid = e.uuid;
            const single = await cache.tryGet(uuid, async () => {
                const link = `https://www.infoq.cn/article/${uuid}`;
                const resp = await got({
                    method: 'post',
                    url: detailUrl,
                    headers: {
                        Referer: link,
                    },
                    json: {
                        uuid: uuid,
                    },
                });

                const data = resp.data.data;
                const author = data.author ? data.author.map((p) => p.nickname).join(',') : data.no_author;
                const pubDate = new Date();
                pubDate.setTime(data.publish_time);

                return {
                    title: data.article_title,
                    description: data.content,
                    pubDate,
                    author: author,
                    link,
                };
            });

            return Promise.resolve(single);
        })
    );

    return items;
};

module.exports = {
    ProcessFeed,
};
