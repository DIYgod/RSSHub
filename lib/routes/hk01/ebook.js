const got = require('@/utils/got');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const tokenresponse = await got({
        method: 'get',
        url: `https://emag-api.hk01.com/v1/access_token`,
    });
    const hk01Authorization = tokenresponse.data.data[0].token;
    const response = await got({
        method: 'get',
        url: `https://emag-api.hk01.com/v1/books?devices=web&sourceId=72&p=1&pnum=8&itm_source=service_entrance&itm_medium=web&source_id=72&`,
        headers: {
            Authorization: hk01Authorization,
        },
    });
    const ebookdata = response.data.data;
    // 获取最近周刊的文章
    const issuedata = await Promise.all(
        ebookdata.slice(0, 1).map(async (item) => {
            const link = `https://emag-api.hk01.com/v1/toc?bookId=${item.book_id}`;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response2 = await got({
                method: 'get',
                url: link,
                headers: {
                    Authorization: hk01Authorization,
                },
            });
            // 返回单个的issue下的内容。
            const data2 = response2.data.data;
            const single = await Promise.all(
                data2.map(async (item) => {
                    const list2 = item.items;
                    // 每个Category列表下所有的文章，返回的articles里，每个Category为一个数组，底下有N个文章object
                    const articles = Promise.all(
                        list2.map(async (item) => {
                            // 单个Category下单个的文章
                            const iurl = `https://emag-api.hk01.com/v1/articles?articleId=${item.articleId}`;
                            const response3 = await got({
                                method: 'get',
                                url: iurl,
                                headers: {
                                    Authorization: hk01Authorization,
                                },
                            });
                            const inner = response3.data.data;
                            const ititle = inner.title[0].content;
                            const istory = inner.story;
                            const icat = inner.categoryName;
                            const issue = inner.journalName;
                            const ilink = `https://ebook.hk01.com/article/${item.articleId}`;
                            const idate = dayjs.utc(item.coverImage.match(/com.([0-9]+)./)[1], 'YYYYMMDD');
                            const icontent = {
                                title: `${issue}|${icat}|${ititle}`,
                                link: ilink,
                                description: istory,
                                pubDate: idate,
                            };
                            return Promise.resolve(icontent);
                        })
                    );
                    return Promise.resolve(articles);
                })
            );

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    const list = [];
    issuedata.forEach((issue) => {
        issue.forEach((cat) => {
            cat.forEach((item) => {
                list.push(item);
            });
        });
    });

    ctx.state.data = {
        title: `《香港01》周報`,
        link: `https://ebook.hk01.com`,

        item: list.map((item) => ({
            title: item.title,
            description: item.description,
            link: item.link,
            pubDate: item.pubDate,
        })),
    };
};
