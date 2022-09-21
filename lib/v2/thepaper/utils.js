const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');

module.exports = {
    ProcessItem: async (item, ctx) => {
        if (item.link) {
            // external link
            return {
                title: item.name,
                link: item.link,
                description: item.name,
                pubDate: parseDate(item.pubTimeLong),
                media: {
                    content: {
                        url: item.pic,
                    },
                },
            };
        } else {
            const itemUrl = `https://m.thepaper.cn/detail/${item.contId}`;
            return await ctx.cache.tryGet(itemUrl, async () => {
                const res = await got(itemUrl);
                const data = JSON.parse(cheerio.load(res.data)('#__NEXT_DATA__').html());
                const detailData = data.props.pageProps.detailData;

                if (detailData.contType === 8) {
                    // article type
                    const liveDetail = detailData.liveDetail;
                    return {
                        title: liveDetail.name,
                        link: itemUrl,
                        description: liveDetail.summary,
                        pubDate: parseDate(liveDetail.pubTime),
                        author: liveDetail.author,
                        media: {
                            content: {
                                url: item.pic,
                            },
                        },
                    };
                } else {
                    // others
                    const contentDetail = detailData.contentDetail;
                    return {
                        title: contentDetail.name,
                        link: itemUrl,
                        description: contentDetail.content,
                        pubDate: parseDate(contentDetail.pubTime),
                        author: contentDetail.author,
                        media: {
                            content: {
                                url: item.pic,
                            },
                        },
                    };
                }
            });
        }
    },
};
