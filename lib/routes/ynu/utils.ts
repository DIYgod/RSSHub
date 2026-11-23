import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

function restorePdfContent($: CheerioAPI) {
    $('.v_news_content script').each((_, element) => {
        const script = $(element).text();
        const pdfPath = /showVsbpdfIframe\(\s*(['"])(.*?)\1/.exec(script)?.[2];
        const pagesJson = /var\s+vsb_pdf_image_data\s*=\s*(\[[\s\S]*?\])/.exec(script)?.[1];
        if (!pdfPath || !pagesJson) {
            return;
        }
        const pages: string[] = JSON.parse(pagesJson);
        const content = $('<span></span>').append($('<a>PDF</a>').attr('href', pdfPath));
        for (const page of pages) {
            content.append($('<img>').attr('src', page));
        }
        $(element).replaceWith(content);
    });
}
function appendArticleAttachments($: CheerioAPI, description: string | undefined) {
    const attachments = $('<ul></ul>');
    $('form[name="_newscontent_fromname"] a[href*="DownloadAttachUrl"]').each((_, element) => {
        const anchor = $('<a></a>').attr('href', $(element).attr('href')).text($(element).text());
        attachments.append($('<li></li>').append(anchor));
    });
    return attachments.children().length ? `${description}\n${$.html(attachments)}` : description;
}
export const processPages = ({
    list,
    host,
    department,
}: {
    list: Array<{
        path: string;
        title: string;
        author: string;
    }>;
    host: string;
    department: string;
}) =>
    pMap(
        list,
        async ({ path, title, author }) => {
            const link = new URL(path, host).href;
            const article = await cache.tryGet(`ynu:article:v5:${department}:${link}`, async () => {
                const response = await ofetch(link);
                const $ = load(response);
                restorePdfContent($);
                let dateString = '';
                switch (department) {
                    case 'grs':
                        dateString =
                            $('#times').text().slice(5) ||
                            $('.ul-rq li')
                                .filter((_, element) => $(element).text().startsWith('日期：'))
                                .text()
                                .slice(3);
                        break;
                    case 'home':
                        dateString = $('.conttime span').text().slice(5);
                        break;
                    case 'jwc':
                        dateString = $('.taitshj').text().slice(5, 15);
                    // No default
                }
                let description = $('.v_news_content').html()?.trim();
                if (department === 'jwc') {
                    const attachment = $('#vsb_content').siblings('ul').html()?.trim();
                    if (attachment) {
                        description += '\n' + attachment;
                    }
                } else if (department === 'grs') {
                    description = appendArticleAttachments($, description);
                }
                return {
                    pubDate: dateString ? parseDate(dateString, 8) : undefined,
                    description,
                };
            });
            return { ...article, title, author, link };
        },
        { concurrency: 3, stopOnError: false }
    );
