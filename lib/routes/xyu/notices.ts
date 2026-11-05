import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { fixArticleContent } from '@/utils/wechat-mp';

function getWechatAuthor(content: CheerioAPI) {
    const author = content('script')
        .toArray()
        .map((element) => {
            try {
                const literal = content(element)
                    .text()
                    .match(/\bvar\s+author\s*=\s*("(?:\\.|[^"\\])*")/)?.[1];
                return literal ? JSON.parse(literal) : undefined;
            } catch {
                return;
            }
        })
        .find((value) => typeof value === 'string' && value.trim());

    return typeof author === 'string' ? author : content('#js_name').text().trim() || undefined;
}

function parseWechatPublication(content: string) {
    const timestamp = content.match(/\bvar\s+ct\s*=\s*["'](\d+)["']\s*;/)?.[1];
    if (!timestamp) {
        return;
    }

    const date = parseDate(timestamp, 'X');
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function fetchDetails(url: string): Promise<{ description?: string; pubDate?: Date; author?: string }> {
    try {
        const response = await ofetch(url);
        const $ = load(response);
        const wechatContent = $('#js_content');
        if (wechatContent.length) {
            return { description: fixArticleContent(wechatContent) || undefined, pubDate: parseWechatPublication(response), author: getWechatAuthor($) };
        }

        const content = $('.v_news_content').first();
        if (!content.length) {
            return {};
        }

        const attachments = $('form[name="_newscontent_fromname"] a[href*="DownloadAttachUrl"], .art-body a[href*="DownloadAttachUrl"]')
            .filter((_, link) => !$(link).closest('.v_news_content').length)
            .toArray()
            .map((link) => `<li>${$.html(link)}</li>`)
            .join('');

        return { description: `${content.html() ?? ''}${attachments ? `<ul>${attachments}</ul>` : ''}` || undefined };
    } catch {
        return {};
    }
}

export const route: Route = {
    path: '/index/tzgg',
    categories: ['university'],
    example: '/xyu/index/tzgg',
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
            source: ['www.xyc.edu.cn/index/tzgg.htm'],
        },
    ],
    name: '官网通知公告',
    maintainers: ['JinMokai'],
    handler,
    url: 'www.xyc.edu.cn/index/tzgg.htm',
};

async function handler() {
    const baseUrl = 'https://www.xyc.edu.cn';
    const url = `${baseUrl}/index/tzgg.htm`;

    const response = await ofetch(url);
    if (!response) {
        return {
            title: '新余学院 - 通知公告',
            link: url,
            item: [],
        };
    }

    const $ = load(response);

    const list = $('.text-list ul li')
        .toArray()
        .map((item) => {
            const currentItem = $(item);
            const link = currentItem.find('a').attr('href');
            if (!link) {
                return null;
            }

            const title = currentItem.find('.list-tx h3').text();
            const description = currentItem.find('.list-tx p').text().trim();
            const day = currentItem.find('.date p').text();
            const yearMonth = currentItem.find('.date span').text();
            const dateText = `${yearMonth}-${day.padStart(2, '0')}`;

            return {
                title,
                link: new URL(link, baseUrl).href,
                description: description || undefined,
                pubDate: timezone(parseDate(dateText, 'YYYY-MM-DD'), 8),
            };
        })
        .filter((item) => item !== null);

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`xyu:notices:detail:v3:${item.link}`, () => fetchDetails(item.link));
            return { ...item, description: details.description ?? item.description, pubDate: details.pubDate ?? item.pubDate, author: details.author };
        },
        { concurrency: 3 }
    );

    return {
        title: '新余学院 - 通知公告',
        link: url,
        item: items,
    };
}
