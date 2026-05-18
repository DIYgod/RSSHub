import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.cs.sjtu.edu.cn';

interface ListItem {
    title: string;
    link: string;
    image: string;
    location: string;
    topic: string;
    speakers: string;
    timeText: string;
}

function absolutize(url: string | undefined): string {
    if (!url) {
        return '';
    }
    return new URL(url, host).href;
}

function parseListing(html: string): ListItem[] {
    const $ = load(html);
    return $('.ny-con .u12 > li')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const link = absolutize($el.find('> a').attr('href'));
            const title = $el.find('.txt .tit').text().trim();
            const image = absolutize($el.find('.imgk img').attr('src'));
            // Each <p> is one metadata row: time / location / speaker / topic
            const adRows = $el
                .find('.txt .ad p')
                .toArray()
                .map((p) => $(p).find('span').text().trim())
                .filter(Boolean);
            const findRow = (prefix: string) => adRows.find((s) => s.startsWith(prefix))?.slice(prefix.length) ?? '';
            return {
                title,
                link,
                image,
                timeText: findRow('时间：'),
                location: findRow('地点：'),
                speakers: findRow('报告人：'),
                topic: findRow('主题：'),
            };
        })
        .filter((it) => it.link && it.title);
}

function extractDate(timeText: string): Date | undefined {
    // 2026.05.15 12:00 / 2025.12.15（周一）13:30 / 2025-08-03 / 2026.04.22 10:00
    const match = timeText.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (!match) {
        return undefined;
    }
    const [, y, m, d] = match;
    return timezone(parseDate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`, 'YYYY-MM-DD'), +8);
}

function buildMetaHtml(item: ListItem): string {
    const parts: string[] = [];
    if (item.image) {
        parts.push(`<p><img src="${item.image}" referrerpolicy="no-referrer" /></p>`);
    }
    if (item.timeText) {
        parts.push(`<p>时间：${item.timeText}</p>`);
    }
    if (item.location) {
        parts.push(`<p>地点：${item.location}</p>`);
    }
    if (item.topic) {
        parts.push(`<p>主题：${item.topic}</p>`);
    }
    return parts.join('');
}

function enrichItem(item: ListItem): Promise<DataItem> {
    return cache.tryGet(item.link, async () => {
        let description = buildMetaHtml(item);
        let pubDate = extractDate(item.timeText);

        try {
            const response = await got(item.link);
            const $ = load(response.data);
            const $body = $('.xw-cont');
            // In-site article page — enrich with body content.
            // Otherwise it's a WeChat MP redirect interstitial; keep the SJTU link as-is so the reader follows the redirect.
            if ($body.length > 0) {
                const $txt = $body.find('.txt');
                $txt.find('img').each((_, e) => {
                    const src = $(e).attr('src') || $(e).attr('_src');
                    if (src) {
                        $(e).attr('src', absolutize(src));
                    }
                });
                $txt.find('a').each((_, e) => {
                    const href = $(e).attr('href');
                    if (href) {
                        $(e).attr('href', absolutize(href));
                    }
                });
                description = `${buildMetaHtml(item)}<hr/>${$txt.html() ?? ''}`;

                const publishedText = $body.find('.jj p').first().text();
                const publishedMatch = publishedText.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                if (publishedMatch) {
                    const [, y, m, d] = publishedMatch;
                    pubDate = timezone(parseDate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`, 'YYYY-MM-DD'), +8);
                }
            }
        } catch {
            // Fall back to listing-only metadata
        }

        return {
            title: item.title,
            link: item.link,
            description,
            author: item.speakers || undefined,
            pubDate,
        };
    }) as Promise<DataItem>;
}

export const route: Route = {
    path: '/cs/xshd',
    categories: ['university'],
    example: '/sjtu/cs/xshd',
    parameters: {},
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
            source: ['www.cs.sjtu.edu.cn/xshd.html'],
            target: '/cs/xshd',
        },
    ],
    name: '计算机学院 - 学术活动',
    maintainers: ['BeaCox'],
    handler,
    url: 'www.cs.sjtu.edu.cn/xshd.html',
};

async function handler(): Promise<Data> {
    const listLink = `${host}/xshd.html`;
    const { data } = await got(listLink);
    const items = parseListing(data);
    const enriched = await Promise.all(items.map((it) => enrichItem(it)));

    return {
        title: '上海交通大学计算机学院 - 学术活动',
        link: listLink,
        description: '上海交通大学计算机学院（网络空间安全学院、密码学院）学术活动',
        language: 'zh-CN',
        item: enriched,
    };
}
