import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

class ArticleAccessError extends Error {}
const domain = 'whu.edu.cn';
const attachmentMimeTypes = {
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    txt: 'text/plain',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
} satisfies Record<string, string>;
const isAttachmentExtension = (key: string): key is keyof typeof attachmentMimeTypes => Object.hasOwn(attachmentMimeTypes, key);
function getAttachmentMimeType(title: string) {
    const extension = title.split('.').pop()?.toLowerCase();
    return extension && isAttachmentExtension(extension) ? attachmentMimeTypes[extension] : undefined;
}
function parseCalendarDate(value: string | undefined, format: string | string[] = 'YYYY-MM-DD') {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value.trim(), format, true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
function parsePublicationDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        return parseCalendarDate(value);
    }
    const date = parseDate(value.trim(), ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'], true);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}
type ArticleDetails = Pick<DataItem, 'description' | 'author' | 'category' | 'guid' | 'enclosure_url' | 'enclosure_type'> & {
    articleTitle?: string;
    publicationDate?: string;
    listTitle: DataItem['title'];
    listDate?: number;
};
/**
 * Process the meta information from the HTML content.
 *
 * @param {CheerioAPI} $ - The parsed HTML document.
 * @returns {Object} The meta information extracted from the content.
 */
const processMeta = ($: CheerioAPI): Record<string, string> =>
    Object.fromEntries(
        $('meta[name][content]')
            .toArray()
            .map((element) => [$(element).attr('name')!, $(element).attr('content')!])
    );
/**
 * Get a specific meta value from the meta object.
 *
 * @param {Object} metaObject - The meta object.
 * @param {string} key        - The key of the meta value to retrieve.
 * @returns {string|undefined} The value of the specified meta key, or undefined if not found.
 */
const getMeta = (metaObject, key) => (Object.hasOwn(metaObject, key) ? metaObject[key] : undefined);
/**
 * Retrieves item details from a given link and updates the item object.
 * @param {Object} item    - The item object to be updated.
 * @param {string} rootUrl - The root URL of the item's link.
 * @returns {Promise<object>} The updated item object.
 */
const getItemDetail = async (item, rootUrl): Promise<ArticleDetails> => {
    const { data: detailResponse } = await got(item.link);
    const content = load(detailResponse);
    if (content('title').text() === '用户验证' && content('body').text().includes('验证码')) {
        throw new ArticleAccessError(`Article access verification required at ${item.link}`);
    }
    if (content('div.v_news_content').length !== 1) {
        throw new Error(`Article body not found at ${item.link}`);
    }
    // Resolve each image while preserving its surrounding content and captions.
    content('div.v_news_content img').each((_, element) => {
        const image = content(element);
        const source = image.attr('orisrc') || image.attr('src');
        if (source) {
            image.attr('src', new URL(source, item.link).href);
        }
    });
    // Missing the `src` properties for the videos.
    // The `src` property should be replaced with the value of `vurl` to play the video.
    // Replace videos in the content with custom JSX template.
    content('script[name="_videourl"]').each((_, el) => {
        const video = content(el);
        const src = video.attr('vurl');
        if (!src) {
            video.remove();
            return;
        }
        const videoSrc = new URL(src, item.link).href;
        video.replaceWith(
            renderDescription({
                video: {
                    src: videoSrc,
                    width: content(video).prop('vwidth'),
                    height: content(video).prop('vheight'),
                },
            })
        );
    });
    // Extract the description from the content.
    const description = content('div.v_news_content').html();
    // Only the source CMS download anchors represent attachments.
    const downloadAnchors = content('form[name="_newscontent_fromname"] a[href*="news.DownloadAttachUrl"]');
    const downloads = downloadAnchors.toArray().map((anchor) => ({
        title: content(anchor).text(),
        link: new URL(content(anchor).attr('href')!, rootUrl).href,
    }));
    const attachments = downloadAnchors
        .filter((_, anchor) => !content(anchor).parents('div.v_news_content').length)
        .toArray()
        .map((anchor) => ({
            title: content(anchor).text(),
            link: new URL(content(anchor).attr('href')!, rootUrl).href,
        }));
    // Process the meta information from the detail response.
    const meta = processMeta(content);
    const details: ArticleDetails = {
        articleTitle: getMeta(meta, 'ArticleTitle'),
        listTitle: item.title,
        listDate: isNullish(item.pubDate) ? undefined : parseDate(item.pubDate).getTime(),
        publicationDate: getMeta(meta, 'PubDate'),
        description: renderDescription({ description: description ?? undefined, attachments }),
        author: getMeta(meta, 'ContentSource'),
        category: getMeta(meta, 'Keywords')?.split(' ').filter(Boolean) ?? [],
        guid: getMeta(meta, 'Url') ?? item.link,
    };
    if (downloads.length > 0) {
        details.enclosure_url = downloads[0].link;
        details.enclosure_type = getAttachmentMimeType(downloads[0].title);
    }
    return details;
};
/**
 * Process items asynchronously.
 *
 * @param {Array<Object>} items - The array of items to process.
 * @param {string} rootUrl      - The root URL.
 * @returns {Array<Promise<Object>>} An array of promises that resolve to the processed items.
 */
const processItems = async <
    T extends DataItem & {
        link: string;
    },
>(
    items: T[],
    rootUrl: string
): Promise<T[]> =>
    await unwrapFirstFailure(
        pMap<T, T>(
            items,
            async (item) => {
                const hostname = new URL(item.link).hostname;
                if (hostname !== domain && !hostname.endsWith(`.${domain}`)) {
                    return item;
                }
                try {
                    const detail = await cache.tryGet(`whu:details:download-mime:${item.link}`, async () => await getItemDetail(item, rootUrl));
                    const listDate = isNullish(item.pubDate) ? undefined : parseDate(item.pubDate).getTime();
                    return {
                        ...item,
                        title: detail.listTitle === item.title ? (detail.articleTitle ?? item.title) : item.title,
                        description: detail.description,
                        author: detail.author,
                        category: detail.category,
                        guid: detail.guid,
                        pubDate: detail.listDate === listDate ? (parsePublicationDate(detail.publicationDate) ?? item.pubDate) : item.pubDate,
                        enclosure_url: detail.enclosure_url,
                        enclosure_type: detail.enclosure_type,
                    };
                } catch (error) {
                    if (error instanceof ArticleAccessError || (error instanceof Error && error.name === 'FetchError')) {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        )
    );
export { domain, getMeta, parseCalendarDate, processItems, processMeta };
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
function isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}
