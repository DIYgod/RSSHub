import { createHash } from 'node:crypto';

import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://www.keke1.app';

const solveChallenge = (html: string) => {
    const strings = Array.from(html.match(/const a0_0x[0-9a-f]+=\[([^\]]+)\]/)?.[1].matchAll(/'([^']*)'/g) ?? [], (m) => m[1]);
    const challenge = strings.find((s) => /^[0-9A-F]{40}$/.test(s));
    const cookieName = strings.find((s) => s.endsWith('='));
    const target = html.match(/s\[n1\]===(0x[0-9a-f]+)&&s\[n1\+0x1\]===(0x[0-9a-f]+)/);
    if (!challenge || !cookieName || !target) {
        throw new Error('cdndefend format changed');
    }
    const offset = Number.parseInt(challenge[0], 16);
    const [b0, b1] = [Number(target[1]), Number(target[2])];
    for (let i = 0; i < 100_000_000; i++) {
        const digest = createHash('sha1')
            .update(challenge + i)
            .digest();
        if (digest[offset] === b0 && digest[offset + 1] === b1) {
            return `${cookieName}${challenge}${i}`;
        }
    }
    throw new Error('cdndefend challenge has no solutions');
};

export const fetchPage = async (path: string) => {
    const cacheKey = 'keke:cdndefend';
    const url = `${baseUrl}${path}`;
    const cookie = await cache.get(cacheKey, false);
    const first = await ofetch.raw<string>(url, { headers: cookie ? { cookie } : {}, ignoreResponseError: true });
    if (first.status === 200) {
        return first._data ?? '';
    }
    if (first.status !== 850) {
        throw new Error(`Unexpected status ${first.status} for ${url}`);
    }
    const solved = solveChallenge(first._data ?? '');
    const second = await ofetch.raw<string>(url, { headers: { cookie: solved }, ignoreResponseError: true });
    if (second.status !== 200) {
        throw new Error(`cdndefend challenge failed with ${second.status} for ${url}`);
    }
    await cache.set(cacheKey, solved, config.cache.routeExpire);
    return second._data ?? '';
};

export const parseListItems = ($: CheerioAPI, scope: Cheerio<AnyNode>) =>
    scope
        .find('a.v-item')
        .toArray()
        .map((el) => ({
            title: $(el).find('.v-item-title:not([style])').text(),
            link: new URL($(el).attr('href') ?? '', baseUrl).href,
        }));

export const fetchDetail = (item: { title?: string; link: string }) =>
    cache.tryGet(item.link, async () => {
        const html = await fetchPage(new URL(item.link).pathname);
        const $ = load(html);
        const poster = $('.detail-pic img').attr('data-original');
        const rows = $('.detail-info-row')
            .toArray()
            .map((row) => [$(row).find('.detail-info-row-side').text(), $(row).find('.detail-info-row-main').text().replaceAll(/\s+/g, ' ').trim()])
            .filter(([, value]) => value)
            .map(([label, value]) => `<p>${label} ${value}</p>`)
            .join('');
        return {
            title: item.title || $('.detail-title strong').eq(1).text(),
            link: item.link,
            guid: `keke.app:${item.link.match(/\/detail\/(\d+)/)?.[1]}`,
            category: $('.detail-tags-item')
                .toArray()
                .flatMap((el) => $(el).text().split(' / ')),
            description: `${poster ? `<img src="${new URL(poster, 'https://vres.cyscyy.com').href}">` : ''}<p>${$('.detail-desc p').text()}</p>${rows}`,
        } as DataItem;
    });
