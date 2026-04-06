import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import got from '@/utils/got';

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
    },
    radar: [
        {
            source: ['rule34video.com/latest-updates'],
            target: '/latest',
        },
    ],
    name: 'Latest Updates',
    maintainers: ['Dgama'],
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

async function handler(_ctx: Context) {
    const response = await got({
        method: 'get',
        url: 'https://www.rule34video.com/latest-updates',
        headers: {
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
            const preview =
                $el.find('img.thumb.lazy-load').attr('data-original') ||
                $el.find('img.thumb.lazy-load').attr('src') ||
                undefined;
            const duration = $el.find('.time').text().trim() || undefined;
            const added = $el.find('.added').text().replaceAll(/\s+/g, ' ').trim() || undefined;
            const rating = $el.find('.rating').text().trim() || undefined;
            const views = $el.find('.views').text().trim() || undefined;
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
        link: 'https://www.rule34video.com/latest-updates',
        description: 'Latest updates from Rule34 Video',
        item: items.map((item) => buildDataItem(item)),
    };
}

function buildDataItem(item: VideoItem) {
    const descriptionParts: string[] = [];

    if (item.title) {
        descriptionParts.push(item.title);
    }
    if (item.duration) {
        descriptionParts.push(`Duration: ${item.duration}`);
    }
    if (item.views) {
        descriptionParts.push(`Views: ${item.views}`);
    }
    if (item.rating) {
        descriptionParts.push(`Rating: ${item.rating}`);
    }

    const qualities: string[] = [];
    if (item.isHD) {
        qualities.push('HD');
    }
    if (item.hasSound) {
        qualities.push('Has Sound');
    }
    if (qualities.length > 0) {
        descriptionParts.push(`Quality: ${qualities.join(', ')}`);
    }

    if (item.preview) {
        descriptionParts.push(`Image: ${item.preview}`);
    }

    const description = descriptionParts.join(' | ');
    const pubDate = item.added ? parseRelativeDate(item.added) : new Date();

    return {
        title: item.title,
        link: item.link,
        description,
        image: item.preview,
        pubDate: pubDate.toISOString(),
        guid: item.videoId ? `rule34video:${item.videoId}` : item.link,
        category: item.isHD ? ['HD'] : [],
    };
}

function parseRelativeDate(text: string) {
    const match = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
    if (!match) {
        return new Date();
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const now = new Date();

    switch (unit) {
        case 'second':
            return new Date(now.getTime() - value * 1000);
        case 'minute':
            return new Date(now.getTime() - value * 60 * 1000);
        case 'hour':
            return new Date(now.getTime() - value * 60 * 60 * 1000);
        case 'day':
            return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
        case 'week':
            return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
        case 'month':
            return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
        case 'year':
            return new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000);
        default:
            return now;
    }
}
