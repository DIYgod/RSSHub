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
                    const media = detailData.contType === 9 ? item.videos.url : item.pic;
                    return {
                        title: contentDetail.name,
                        link: itemUrl,
                        description: contentDetail.content || contentDetail.summary,
                        pubDate: parseDate(contentDetail.pubTime),
                        author: contentDetail.author,
                        media: {
                            content: {
                                url: media,
                            },
                            thumbnails: {
                                url: item.pic,
                            },
                        },
                    };
                }
            });
        }
    },
    ChannelIdToName: (nodeId, next_data) => {
        const channelList = next_data.props.appProps.menu.channelList;
        for (const c of channelList) {
            if (c.nodeId.toString() === nodeId.toString()) {
                return c.name;
            }
        }
    },
    ListIdToName: (listId, next_data) => {
        const channelList = next_data.props.appProps.menu.channelList;
        for (const c of channelList) {
            if (c.childNodeList && c.childNodeList.length > 1) {
                for (const l of c.childNodeList) {
                    if (l.nodeId.toString() === listId.toString()) {
                        return l.name;
                    }
                }
            }
        }
    },
};
