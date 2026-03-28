import { load } from 'cheerio';
import type { Element } from 'domhandler';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://rumble.com';

export const route: Route = {
    path: '/c/:channel',
    categories: ['social-media'],
    view: ViewType.Videos,
    name: 'Channel',
    maintainers: ['luckycold'],
    example: '/rumble/c/Timcast',
    parameters: {
        channel: 'Channel slug from `https://rumble.com/c/<channel>`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['rumble.com/c/:channel'],
            target: '/c/:channel',
        },
    ],
    handler,
};

function parseChannelTitle($: ReturnType<typeof load>): string {
    const h1 = $('h1').first().text().trim();
    if (h1) {
        return h1;
    }

    const title = $('title').first().text().trim();
    return title || 'Rumble';
}

function parseItemFromVideoElement($: ReturnType<typeof load>, videoElement: Element): DataItem | null {
    const $video = $(videoElement);
    const $link = $video.find('.title__link[href], .videostream__link[href]').first();
    const href = $link.attr('href')?.trim();
    if (!href) {
        return null;
    }

    const url = new URL(href, rootUrl);
    url.search = '';
    url.hash = '';

    const $title = $video.find('.thumbnail__title').first();
    const title = $title.attr('title')?.trim() || $title.text().trim() || url.pathname;

    const $img = $video.find('img.thumbnail__image, .thumbnail__thumb img').first();
    const imageRaw = $img.attr('src') || $img.attr('data-src');
    const image = imageRaw ? new URL(imageRaw, rootUrl).href : undefined;
    const pubDateRaw = $video.find('time.videostream__time[datetime], time[datetime]').first().attr('datetime')?.trim();
    const pubDate = pubDateRaw ? parseDate(pubDateRaw) : undefined;

    const media = image
        ? {
              thumbnail: {
                  url: image,
              },
              content: {
                  url: image,
                  medium: 'image',
              },
          }
        : undefined;

    const description = image ? `<p><img src="${image}"></p>` : undefined;

    return {
        title,
        link: url.href,
        description,
        itunes_item_image: image,
        media,
        pubDate,
    };
}

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const channelUrl = new URL(`/c/${encodeURIComponent(channel)}`, rootUrl).href;

    const response = await ofetch(channelUrl, {
        headers: {
            'user-agent': config.trueUA,
        },
        retryStatusCodes: [403],
    });

    const $ = load(response);

    const title = parseChannelTitle($);

    const uniqueIds = new Set<string>();
    const items = $('.channel-listing__container .videostream[data-video-id], .videostream.thumbnail__grid--item[data-video-id]')
        .toArray()
        .map((element) => {
            const videoId = $(element).attr('data-video-id')?.trim();
            if (!videoId || uniqueIds.has(videoId)) {
                return null;
            }

            uniqueIds.add(videoId);
            return parseItemFromVideoElement($, element);
        })
        .filter((item): item is DataItem => Boolean(item && item.link));

    return {
        title: `Rumble - ${title}`,
        link: channelUrl,
        item: items,
    };
}
