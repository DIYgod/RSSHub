import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

function parsePublicationDate(value: string) {
    const date = parseDate(value, 'YYYY-MM-DD', true);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function fetchDetails(url: string) {
    const response = await ofetch(url);
    const $ = load(response);
    const content = $('.v_news_content').first();
    const attachments = $('.art-body a[href*="DownloadAttachUrl"]')
        .filter((_, link) => !$(link).closest('.v_news_content').length)
        .toArray()
        .map((link) => `<li>${$.html(link)}</li>`)
        .join('');

    return {
        description: `${content.html() ?? ''}${attachments ? `<ul>${attachments}</ul>` : ''}` || undefined,
    };
}

export const route: Route = {
    path: '/library',
    categories: ['university'],
    example: '/xyu/library',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '图书馆通知公告',
    maintainers: ['JinMokai'],
    handler,
    url: 'lib.xyc.edu.cn/index/tzgg.htm',
    radar: [
        {
            source: ['lib.xyc.edu.cn/index/tzgg.htm'],
            target: '/library',
        },
    ],
};

async function handler() {
    const baseUrl = 'https://lib.xyc.edu.cn';
    const url = `${baseUrl}/index/tzgg.htm`;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.text-list ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            const title = $link.attr('title') || $link.text();
            const relativeUrl = $link.attr('href');
            const link = relativeUrl ? new URL(relativeUrl, baseUrl).href : '';
            // Read the source date-only publication label.
            const dateText = $item.find('.date').text().trim() || $item.text().match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
            const pubDate = parsePublicationDate(dateText);

            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item.title && item.link));

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(item.link, () => fetchDetails(item.link));
            return { ...item, description: details.description };
        },
        { concurrency: 3 }
    );

    return {
        title: '新余学院图书馆通知公告',
        link: url,
        item: items,
    };
}
