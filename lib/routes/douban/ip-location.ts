import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import md5 from '@/utils/md5';

export function parseIpLocations(html: string): string[] {
    const $ = load(html);
    const categories = new Set<string>();
    const authorIp = $('.topic-meta .ip-location').first().text();
    if (authorIp) {
        categories.add(`IP属地：${authorIp}`);
    }
    for (const element of $('#comments .pubtime').toArray()) {
        const ip = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\s+(\S.*)$/.exec($(element).text())?.[1];
        if (ip) {
            categories.add(`回帖IP属地：${ip}`);
        }
    }
    return [...categories];
}

export async function getIpLocations(link: string): Promise<string[]> {
    const url = new URL(link);
    if (url.hostname !== 'www.douban.com') {
        return [];
    }
    url.search = '';
    url.hash = '';
    try {
        return await cache.tryGet(`douban:ip-location:${url.href}:${md5(config.douban.cookie || 'visitor')}`, async () => {
            const { data } = await got(url.href, { headers: { Cookie: config.douban.cookie } });
            return parseIpLocations(data);
        });
    } catch {
        // Optional metadata must not hide otherwise accessible posts.
        logger.warn('Unable to retrieve a Douban post IP location. Verify source access and DOUBAN_COOKIE.');
        return [];
    }
}
