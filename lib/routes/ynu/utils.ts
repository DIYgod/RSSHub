import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function resolveArticleLink(value: string, baseUrl: string) {
    const href = value.trim();
    if (!href || href.startsWith('#')) {
        return;
    }
    try {
        const url = new URL(href, baseUrl);
        return isOneOf(url.protocol, ['http:', 'https:']) ? url.href : undefined;
    } catch {
        return;
    }
}
function parsePublishedDate(value: string) {
    const match = /^(\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?)?$/.exec(value.trim());
    if (!match) {
        return;
    }
    const normalized = match[2] ? `${match[1]} ${match[2]}.${(match[3] ?? '0').padEnd(3, '0')}` : match[1];
    const date = parseDate(normalized, match[2] ? 'YYYY-MM-DD HH:mm:ss.SSS' : 'YYYY-MM-DD', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}
function restorePdfContent($: CheerioAPI, link: string) {
    $('.v_news_content script').each((_, element) => {
        const script = $(element).text();
        const pdfPath = /showVsbpdfIframe\(\s*(['"])(.*?)\1/.exec(script)?.[2];
        const pdfUrl = pdfPath ? resolveArticleLink(pdfPath, link) : undefined;
        if (!pdfUrl) {
            return;
        }
        const content = $('<span></span>').append($('<a>PDF</a>').attr('href', pdfUrl));
        const pagesJson = /var\s+vsb_pdf_image_data\s*=\s*(\[[\s\S]*?\])/.exec(script)?.[1];
        let pages: unknown = [];
        if (pagesJson) {
            try {
                pages = JSON.parse(pagesJson);
            } catch {
                pages = [];
            }
        }
        if (Array.isArray(pages)) {
            for (const page of pages) {
                const url = typeof page === 'string' ? resolveArticleLink(page, link) : undefined;
                if (url) {
                    content.append($('<img>').attr('src', url));
                }
            }
        }
        $(element).replaceWith(content);
    });
}
function appendArticleAttachments($: CheerioAPI, link: string, description: string | undefined) {
    const seen = new Set(
        $('.v_news_content a[href]')
            .toArray()
            .map((element) => resolveArticleLink($(element).attr('href') ?? '', link))
    );
    const attachments = $('<ul></ul>');
    $('form[name="_newscontent_fromname"] a[href*="DownloadAttachUrl"]').each((_, element) => {
        const url = resolveArticleLink($(element).attr('href') ?? '', link);
        if (!url || seen.has(url)) {
            return;
        }
        const parsed = new URL(url);
        const name = $(element).text().trim();
        if (parsed.pathname !== '/system/_content/download.jsp' || parsed.searchParams.get('urltype') !== 'news.DownloadAttachUrl' || !name) {
            return;
        }
        seen.add(url);
        const attachmentWrapper1 = $('<li></li>');
        const attachmentAnchor1 = $('<a></a>').attr('href', url).text(name);
        attachmentWrapper1.append(attachmentAnchor1);
        attachments.append(attachmentWrapper1);
    });
    return attachments.children().length ? [description, $.html(attachments)].filter(Boolean).join('\n') : description;
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
        list.flatMap((item) => {
            const link = resolveArticleLink(item.path, host);
            return link ? { ...item, link } : [];
        }),
        async ({ link, title, author }) => {
            const article = await cache.tryGet(`ynu:article:v5:${department}:${link}`, async () => {
                const response = await ofetch(link);
                const $ = load(response);
                restorePdfContent($, link);
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
                        description = [description, attachment].filter(Boolean).join('\n');
                    }
                } else if (department === 'grs') {
                    description = appendArticleAttachments($, link, description);
                }
                return {
                    pubDate: parsePublishedDate(dateString),
                    description,
                };
            });
            return { ...article, title, author, link };
        },
        { concurrency: 3, stopOnError: false }
    );
function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
