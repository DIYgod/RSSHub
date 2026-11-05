import { type CheerioAPI, load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const parseSourceDate = (value?: string | number) => {
    if (value === undefined || value === '') {
        return;
    }
    const sourceValue = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value) ? `${value.replace(' ', 'T')}+08:00` : value;
    const date = parseDate(sourceValue);
    return Number.isNaN(date.getTime()) ? undefined : date;
};
const defaultRssItem = (item) => ({
    title: item.name,
    link: item.link || `https://m.thepaper.cn/${item.cornerLabelDesc === '短剧' ? 'series/' : 'newsDetail_forward_'}${item.contId}`,
    pubDate: parseSourceDate(item.pubTimeLong) ?? parseSourceDate(item.publishTime),
    author: item.author || item.authorInfo?.sname || item.trackAuthor || undefined,
    category: [...(item.tagList?.map((tag) => tag.tag) ?? []), ...(item.nodeInfo?.name ? [item.nodeInfo.name] : [])],
    media: {
        content: {
            url: item.pic,
        },
    },
});
async function processItem(item, ctx) {
    const useOldMode = ctx.req.query('old') === 'yes';
    if (item.link) {
        // external link
        return defaultRssItem(item);
    }
    const itemUrl = `https://m.thepaper.cn/${item.cornerLabelDesc && item.cornerLabelDesc === '短剧' ? 'series/' : 'newsDetail_forward_'}${item.contId}`;
    const contentDetail = await cache.tryGet(`${itemUrl}${useOldMode ? ':old' : ''}`, async () => {
        const res = await ofetch(itemUrl);
        const $ = load(res);
        const nextData = $('#__NEXT_DATA__').text();
        const data = JSON.parse(nextData);
        const detailData = data.props.pageProps.detailData;
        return detailData.contentDetail || detailData.liveDetail || detailData.specialDetail?.specialInfo;
    });
    if (!contentDetail) {
        return defaultRssItem(item);
    }
    let description = contentDetail.content || contentDetail.summary || contentDetail.desc || '';
    if (contentDetail.videos && contentDetail.summary && description !== contentDetail.summary) {
        description += contentDetail.summary;
    }
    if (useOldMode) {
        if (contentDetail.videos) {
            description = renderToString(<ThepaperVideoDetail videos={contentDetail.videos} />) + description;
        }
        if (contentDetail.images) {
            description = renderToString(<ThepaperImageDetail images={contentDetail.images} />) + description;
        }
    }
    let pubDate = parseSourceDate(item.pubTimeLong) ?? parseSourceDate(contentDetail.publishTime);
    if (!pubDate && contentDetail.pubTime) {
        pubDate = parseRelativeDate(contentDetail.pubTime);
        if (Number.isNaN(pubDate.getTime())) {
            pubDate = undefined;
        }
    }
    const rssItem: DataItem = {
        title: contentDetail.name || contentDetail.shareName,
        link: itemUrl,
        description,
        category: [...(contentDetail.tagList?.map((t) => t.tag) ?? []), ...(contentDetail.nodeInfo?.name ? [contentDetail.nodeInfo.name] : [])],
        pubDate,
        author: contentDetail.author || item.author || item.authorInfo?.sname || item.trackAuthor || undefined,
        media: {
            content: {
                url: item.pic || contentDetail.videos?.coverUrl || contentDetail.bigPic,
            },
            thumbnails: {
                url: item.sharePic || contentDetail.sharePic,
            },
        },
    };
    const voiceInfo = contentDetail.voiceInfo;
    if ([true, 1, '1'].includes(voiceInfo?.isHaveVoice) && /^https?:\/\/\S+\.mp3(?:[?#]|$)/i.test(voiceInfo?.voiceSrc ?? '')) {
        rssItem.enclosure_type = 'audio/mpeg';
        rssItem.enclosure_url = voiceInfo.voiceSrc;
        rssItem.itunes_item_image = item.pic || contentDetail.videos?.coverUrl;
    }
    return rssItem;
}
export default {
    ProcessItem: processItem,
    ChannelIdToName: (nodeId, nextData) => nextData.props.appProps.menu.channelList.find((c) => c.nodeId.toString() === nodeId.toString()).name,
    ListIdToName: (listId, nextData) => nextData.props.appProps.menu.channelList.flatMap((c) => c.childNodeList || []).find((l) => l.nodeId.toString() === listId.toString())?.name,
    ExtractLogo: ($: CheerioAPI) => {
        const source = $('img.imageCover').attr('src');
        return source ? new URL(source, 'https://m.thepaper.cn').href : undefined;
    },
};
const ThepaperVideoDetail = ({
    videos,
}: {
    videos: {
        url: string;
        coverUrl: string;
    };
}) => (
    <video
        src={videos.url}
        controls
        playsinline
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
const ThepaperImageDetail = ({
    images,
}: {
    images: Array<{
        width?: string | number;
        src?: string;
        description?: string;
    }>;
}) => (
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
