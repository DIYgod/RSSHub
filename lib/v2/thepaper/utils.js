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

                const contentDetail = detailData.contentDetail || detailData.liveDetail;
                const media = (contentDetail.videos && contentDetail.videos.url) || item.pic || contentDetail.sharePic;
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
                            url: item.pic || contentDetail.sharePic,
                        },
                    },
                };
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
            if (c.childNodeList && c.childNodeList.length > 0) {
                for (const l of c.childNodeList) {
                    if (l.nodeId.toString() === listId.toString()) {
                        return l.name;
                    }
                }
            }
        }
    },
};
