import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['multimedia'],
    example: '/rule34video/latest',
    description: 'Latest updates from Rule34 Video',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['rule34video.com/latest-updates/'],
            target: '/latest',
        },
    ],
    name: 'Latest Updates',
    maintainers: ['ashi-koki'],
    handler,
};

interface VideoItem {
    title: string;
    link: string;
    preview?: string;
    duration?: string;
    added?: string;
    rating?: string;
    views?: string;
    hasSound: boolean;
    isHD: boolean;
    videoId?: string;
}

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://www.rule34video.com/latest-updates/',
        headers: {
            'User-Agent': config.trueUA,
            Referer: 'https://www.rule34video.com',
        },
    });

    const $ = load(response.data);
    const items = $('a.th.js-open-popup')
        .toArray()
        .map((element) => {
            const $el = $(element);
            const title = $el.attr('title')?.trim() || $el.find('.thumb_title').text().trim();
            const link = $el.attr('href')?.trim() || '';
            const preview = $el.find('img.thumb.lazy-load').attr('data-original');
            const duration = $el.find('.time').text().trim();
            const added = $el.find('.added').text().replaceAll(/\s+/g, ' ').trim();
            const rating = $el.find('.rating').text().trim();
            const views = $el.find('.views').text().trim();
            const hasSound = $el.find('.sound').length > 0;
            const isHD = $el.find('.quality').length > 0;
            const videoId = link.match(/\/video\/(\d+)\//)?.[1];

            return {
                title,
                link,
                preview,
                duration,
                added,
                rating,
                views,
                hasSound,
                isHD,
                videoId,
            } as VideoItem;
        })
        .filter((item) => item.title && item.link);

    return {
        allowEmpty: true,
        title: 'Rule34 Video Latest Updates',
        link: 'https://www.rule34video.com/latest-updates/',
        description: 'Latest updates from Rule34 Video',
        item: items.map((item) => buildDataItem(item)),
    };
}

function buildDataItem(item: VideoItem) {
    let description = '';

    if (item.duration) {
        description += `<p>Duration: ${item.duration}</p>`;
    }
    if (item.views) {
        description += `<p>Views: ${item.views}</p>`;
    }
    if (item.rating) {
        description += `<p>Rating: ${item.rating}</p>`;
    }

    const qualities: string[] = [];
    if (item.isHD) {
        qualities.push('HD');
    }
    if (item.hasSound) {
        qualities.push('Has Sound');
    }
    if (qualities.length > 0) {
        description += `<p>Quality: ${qualities.join(', ')}</p>`;
    }

    if (item.preview) {
        description += `<img src="${item.preview}" alt="${item.title}" />`;
    }

    const pubDate = item.added ? parseRelativeDate(item.added) : undefined;

    return {
        title: item.title,
        link: item.link,
        description,
        image: item.preview,
        ...(pubDate && { pubDate: pubDate.toISOString() }),
        guid: item.videoId ? `rule34video:${item.videoId}` : item.link,
        category: item.isHD ? ['HD'] : [],
    };
}
