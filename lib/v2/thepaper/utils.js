const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

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
                let description = contentDetail.content || contentDetail.summary;

                if (contentDetail.videos) {
                    description =
                        art(path.join(__dirname, 'templates/video_detail.art'), {
                            videos: contentDetail.videos,
                        }) + description;
                }

                return {
                    title: contentDetail.name,
                    link: itemUrl,
                    description,
                    pubDate: parseDate(contentDetail.pubTime),
                    author: contentDetail.author,
                    media: {
                        content: {
                            url: item.pic || contentDetail.sharePic || (contentDetail.videos && contentDetail.videos.coverUrl),
                        },
                        thumbnails: {
                            url: item.pic || contentDetail.sharePic,
                        },
                    },
                };
            });
        }
    },
    ChannelIdToName: (nodeId, next_data) => next_data.props.appProps.menu.channelList.find((c) => c.nodeId.toString() === nodeId.toString()).name,
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
