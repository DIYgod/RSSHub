const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

const defaultRssItem = (item) => ({
    title: item.name,
    link: item.link,
    description: item.name,
    pubDate: parseDate(item.pubTimeLong),
    media: {
        content: {
            url: item.pic,
        },
    },
});

module.exports = {
    ProcessItem: async (item, ctx) => {
        if (item.link) {
            // external link
            return defaultRssItem(item);
        } else {
            const itemUrl = `https://m.thepaper.cn/detail/${item.contId}`;
            return await ctx.cache.tryGet(itemUrl, async () => {
                const res = await got(itemUrl);
                const data = JSON.parse(cheerio.load(res.data)('#__NEXT_DATA__').html());
                const detailData = data.props.pageProps.detailData;
                const contentDetail = detailData.contentDetail || detailData.liveDetail || detailData.specialDetail?.specialInfo;
                if (contentDetail) {
                    let description = contentDetail.content || contentDetail.summary || contentDetail.desc || '';

                    if (contentDetail.videos) {
                        description =
                            art(path.join(__dirname, 'templates/video_detail.art'), {
                                // see https://nanmu.me/zh-cn/posts/2020/strange-html-video-tag-behavior-in-wechat/
                                // for video tag details
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
                        title: contentDetail.name || contentDetail.shareName,
                        link: itemUrl,
                        description,
                        category: contentDetail.tagList?.map((t) => t.tag) ?? [],
                        pubDate: parseDate(item.pubTimeLong || contentDetail.pubTime || contentDetail.publishTime),
                        author: contentDetail.author || '',
                        media: {
                            content: {
                                url: item.pic || contentDetail.videos?.coverUrl || contentDetail.bigPic,
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
                } else {
                    return defaultRssItem(item);
                }
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
