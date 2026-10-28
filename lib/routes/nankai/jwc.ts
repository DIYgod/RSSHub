import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/nankai/jwc',
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
            source: ['jwc.nankai.edu.cn/tzgg/list.htm'],
            target: '/jwc',
        },
    ],
    name: '教务处通知公告',
    maintainers: ['zhongweili', 'vicguo0724'],
    description: '南开大学教务处通知公告',
    url: 'jwc.nankai.edu.cn',
    handler: async () => {
        const baseUrl = 'https://jwc.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/tzgg/list.htm`);
        const $ = load(response);

        // Parse the notice entries from the listing page.
        const list = $('.page-con-list-news .item')
            .toArray()
            .map((item): DataItem => {
                const $item = $(item);
                const $link = $item.find('.t a');
                const $dateDay = $item.find('.d .d-d');
                const $dateMonth = $item.find('.d .d-m');

                // Combine the date components.
                const day = $dateDay.text().trim(); // Format: 04.
                const monthYear = $dateMonth.text().trim(); // Format: 2025/06.
                const fullDate = `${monthYear}/${day}`; // 2025/06/04

                const href = $link.attr('href');
                const link = href ? new URL(href, `${baseUrl}/tzgg/list.htm`).href : undefined;

                return {
                    title: $link.text(),
                    link,
                    pubDate: day && monthYear ? timezone(parseDate(fullDate, 'YYYY/MM/DD'), 8) : undefined,
                };
            })
            .filter((item) => item.link); // Discard entries without a link.

        // Fetch the notice details.
        const items = await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`nankai:jwc:article:v3:${item.link}`, async () => {
                    const detail: Pick<DataItem, 'description' | 'pubDate'> = {};
                    const { data: response } = await got(item.link);
                    const $ = load(response);

                    // Read the publication timestamp from the article page.
                    const publishTimeText = $('.page-news-souse').text();
                    const timeMatch = publishTimeText.match(/发布时间：(\d{4}-\d{2}-\d{2})/);
                    if (timeMatch) {
                        detail.pubDate = timezone(parseDate(timeMatch[1]), 8);
                    }

                    // Extract the article body.
                    const content = $('.page-news-con .wp_articlecontent');
                    if (content.length > 0) {
                        // Replace the PDF player with a download link.
                        content.find('.wp_pdf_player').each((i, el) => {
                            const $el = $(el);

                            const pdfSrc = $el.attr('pdfsrc');
                            const sudyfileAttr = ($(el).attr('sudyfile-attr') || '{}').replaceAll("'", '"');
                            const sudyfileAttrJson = JSON.parse(sudyfileAttr);
                            const fileName = sudyfileAttrJson.title || '未命名文件.pdf';
                            if (pdfSrc) {
                                // Replace the player with the download link.
                                $el.replaceWith(`<p><a href="${pdfSrc}" target="_blank">${fileName}</a></p>`);
                            }
                        });

                        detail.description = content.html();
                    } else {
                        throw new Error(`Could not find the academic notice content: ${item.link}`);
                    }
                    return detail;
                });
                return { ...item, ...detail };
            },
            { concurrency: 3 }
        );

        return {
            title: '南开大学教务处-通知公告',
            link: `${baseUrl}/tzgg/list.htm`,
            item: items,
        };
    },
};
