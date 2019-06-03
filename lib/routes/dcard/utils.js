const axios = require('@/utils/axios');
const cheerio = require('cheerio');

const ProcessFeed = async (list, cache) => {
    const result = await Promise.all(
        list.map(async (item) => {
            const link = `https://www.dcard.tw/f/${item.forumAlias}/p/${item.id}`;

            const content = await cache.tryGet(`dcard${item.id}`, async () => {
                let response;

                // try catch 处理被删除的帖子

                try {
                    response = await axios({
                        method: 'get',
                        url: link,
                        headers: {
                            Referer: 'https://www.dcard.tw/f',
                        },
                    });

                    const $ = cheerio.load(response.data);

                    return $('.Post_content_NKEl9d > div:nth-child(1)').html();
                } catch (error) {
                    return '';
                }
            });

            const single = {
                title: `「${item.forumName}」${item.title}`,
                link,
                description: content,
                author: item.school || '匿名',
                pubDate: item.createdAt,
                guid: item.id,
            };

            return Promise.resolve(single);
        })
    );

    return result.filter((f) => f.description);
};

module.exports = {
    ProcessFeed,
};
