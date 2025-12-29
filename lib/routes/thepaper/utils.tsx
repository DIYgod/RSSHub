import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

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

export default {
    ProcessItem: (item, ctx) => {
        const useOldMode = ctx.req.query('old') === 'yes';
        if (item.link) {
            // external link
            return defaultRssItem(item);
        }
        const itemUrl = `https://m.thepaper.cn/${item.cornerLabelDesc && item.cornerLabelDesc === '短剧' ? 'series' : 'detail'}/${item.contId}`;
        return cache.tryGet(`${itemUrl}${useOldMode ? ':old' : ''}`, async () => {
            const res = await ofetch(itemUrl);
            const $ = load(res);
            const nextData = $('#__NEXT_DATA__').text();
            const data = JSON.parse(nextData);
            const detailData = data.props.pageProps.detailData;
            const contentDetail = detailData.contentDetail || detailData.liveDetail || detailData.specialDetail?.specialInfo;
            if (!contentDetail) {
                return defaultRssItem(item);
            }
            let description = contentDetail.content || contentDetail.summary || contentDetail.desc || '';

            if (contentDetail.videos) {
                description = description + contentDetail.summary;
            }
            if (useOldMode) {
                if (contentDetail.videos) {
                    description = renderToString(<ThepaperVideoDetail videos={contentDetail.videos} />) + description;
                }
                if (contentDetail.images) {
                    description = renderToString(<ThepaperImageDetail images={contentDetail.images} />) + description;
                }
            }

            let pubDate = parseDate(item.pubTimeLong || contentDetail.publishTime);
            if (Number.isNaN(pubDate)) {
                pubDate = parseRelativeDate(contentDetail.pubTime);
            }

            const rss_item = {
                title: contentDetail.name || contentDetail.shareName,
                link: itemUrl,
                description,
                category: [...(contentDetail.tagList?.map((t) => t.tag) ?? []), contentDetail?.nodeInfo?.name ?? []],
                pubDate,
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
        });
    },
    ChannelIdToName: (nodeId, next_data) => next_data.props.appProps.menu.channelList.find((c) => c.nodeId.toString() === nodeId.toString()).name,
    ListIdToName: (listId, next_data) => next_data.props.appProps.menu.channelList.flatMap((c) => c.childNodeList || []).find((l) => l.nodeId.toString() === listId.toString())?.name,
    ExtractLogo: (response) => 'https://m.thepaper.cn' + load(response)('img.imageCover').attr('src'),
};

const ThepaperVideoDetail = ({ videos }: { videos: { url: string; coverUrl: string } }) => (
    <video
        src={videos.url}
        controls
        playsinline="true"
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-orientation="landscape|portrait"
        x5-video-player-fullscreen="true"
        x-webkit-airplay="allow"
        preload="metadata"
        poster={videos.coverUrl}
    ></video>
);

const ThepaperImageDetail = ({ images }: { images: { width?: string | number; src?: string; description?: string }[] }) => (
    <>
        {images.map((image) => (
            <>
                <figure class="wp-block-image size-full">
                    <img width={image.width} src={image.src} />
                </figure>
                <p>{image.description}</p>
            </>
        ))}
    </>
);
