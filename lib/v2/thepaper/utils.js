const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const timezone = require('@/utils/timezone');
const path = require('path');

module.exports = {
    ProcessItem: async (item, ctx) => {
        if (item.link) {
            // external link
            return {
                title: item.name,
                link: item.link,
                description: item.name,
                pubDate: timezone(parseDate(item.pubTimeLong), +8),
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
                let description = contentDetail.content || contentDetail.summary || '';

                if (contentDetail.videos) {
                    description =
                        art(path.join(__dirname, 'templates/video_detail.art'), {
                            videos: contentDetail.videos,
                        }) + description;
                }

                if (contentDetail.images) {
                    description =
                        art(path.join(__dirname, 'templates/image_detail.art'), {
                            images: contentDetail.images,
                        }) + description;
                }

                const rss_item = {
                    title: contentDetail.name,
                    link: itemUrl,
                    description,
                    category: contentDetail.tagList?.map((t) => t.tag) ?? [],
                    pubDate: timezone(parseDate(item.pubTimeLong || contentDetail.pubTime), +8),
                    author: contentDetail.author,
                    media: {
                        content: {
                            url: item.pic || contentDetail.videos?.coverUrl,
                        },
                        thumbnails: {
                            url: item.sharePic || contentDetail.sharePic,
                        },
                    },
                };
                if (contentDetail.voiceInfo?.isHaveVoice) {
                    rss_item.enclosure_type = 'audio/mpeg';
                    rss_item.enclosure_url = contentDetail.voiceInfo.voiceSrc;
                    rss_item.itunes_item_image = item.pic || contentDetail.videos?.coverUrl;
                }
                return rss_item;
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
    ExtractLogo: (response) => 'https://m.thepaper.cn' + cheerio.load(response.data)('img.imageCover').attr('src'),
};
