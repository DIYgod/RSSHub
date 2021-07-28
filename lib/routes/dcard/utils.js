const got = require('@/utils/got');

const ProcessFeed = async (list, cache) => {
    const result = await Promise.all(
        list.map(async (item) => {
            const url = `https://www.dcard.tw/_api/posts/${item.id}`;

            const content = await cache.tryGet(`dcard${item.id}`, async () => {
                let response;

                // try catch 处理被删除的帖子

                try {
                    response = await got({
                        method: 'get',
                        url,
                        headers: {
                            Referer: 'https://www.dcard.tw/f',
                        },
                    });

                    let body = response.data.content;

                    body = body.replace(/(?=https?:\/\/).*?(?<=\.(jpe?g|gif|png))/gi, (m) => `<img src="${m}">`);

                    body = body.replace(/(?=https?:\/\/).*(?<!jpe?g"?>?)$/gim, (m) => `<a href="${m}">${m}</a>`);

                    body = body.replace(/\n/g, '<br>');

                    return body;
                } catch (error) {
                    return '';
                }
            });

            const single = {
                title: `「${item.forumName}」${item.title}`,
                link: `https://www.dcard.tw/f/${item.forumAlias}/p/${item.id}`,
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
