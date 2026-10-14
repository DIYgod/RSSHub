import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

type SourceArticle = {
    url: string;
    AppID?: number;
    ChannelID?: string | number;
    ChannelName: string;
    NewsTitle: string;
    NewsAuthor?: string;
    NewsSource?: string;
    CreaterName?: string;
    CreateDate?: string | number;
    originPic?: string;
    NewsNotes?: string;
    VideoUrl?: string;
};
type Channel = {
    id: string | number;
    name: string;
    slug: string;
    items?: SourceArticle[];
};
type NavigationChannel = {
    name: string;
    slug: string;
    url: string;
};
type ArticleItem = DataItem & {
    link: string;
};
type ArticleDetails = Pick<DataItem, 'description' | 'pubDate'> & {
    videoUrls: string[];
};
type ListedArticleItem = ArticleItem & {
    mainVideo?: ReturnType<typeof getVideo>;
    poster?: string;
};
const rootUrl = 'https://www.yicai.com';
const videoMimeTypes = new Map([
    ['mp4', 'video/mp4'],
    ['m3u8', 'application/vnd.apple.mpegurl'],
    ['webm', 'video/webm'],
    ['ogv', 'video/ogg'],
]);
function getVideo(value: unknown):
    | {
          src: string;
          type?: string;
      }
    | undefined {
    if (typeof value !== 'string') {
        return;
    }
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        return;
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        return;
    }
    const extension = url.pathname.match(/\.([a-z\d]+)$/i)?.[1].toLowerCase();
    return { src: value, type: extension ? videoMimeTypes.get(extension) : undefined };
}
function getPublicationDate(value: unknown): Date | undefined {
    if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}
function getArticleDate(content: CheerioAPI): Date | undefined {
    const dataScript = content("script[src='/js/alert.min.js']").next().text() || content('title').next().text();
    const match = dataScript.match(/_pb = (\[.*?\]);/);
    if (!match) {
        return;
    }
    let entries: unknown;
    try {
        entries = JSON.parse(match[1].replaceAll("'", '"'));
    } catch (error) {
        if (error instanceof SyntaxError) {
            return;
        }
        throw error;
    }
    if (!Array.isArray(entries) || entries.some((entry) => !(Array.isArray(entry) && entry.length >= 2))) {
        return;
    }
    const actime = new Map(entries as Array<[unknown, unknown]>).get('actime');
    if (typeof actime !== 'string' || !actime.trim()) {
        return;
    }
    // The source uses hour-only offsets such as +08; retain the supplied offset.
    const normalized = actime.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?[+-]\d{2})$/, '$1:00');
    const date = parseDate(normalized);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
function getNavigationChannels(html: string, section: 'news' | 'video'): NavigationChannel[] {
    const content = load(html);
    return content('li > a[href]')
        .toArray()
        .flatMap((node) => {
            const anchor = content(node);
            let url: URL;
            try {
                url = new URL(anchor.attr('href')!, rootUrl);
            } catch {
                return [];
            }
            const parts = url.pathname.split('/').filter(Boolean);
            if (url.origin !== rootUrl || url.username || url.password || url.search || url.hash || parts.length !== 2 || parts[0] !== section) {
                return [];
            }
            return { name: anchor.text(), slug: parts[1], url: url.href };
        });
}
function getBreadcrumbChannel(
    html: string,
    section: 'news' | 'video'
): {
    id: number;
    name: string;
} {
    const content = load(html);
    const script = content('script')
        .toArray()
        .map((node) => content(node).text())
        .join('\n');
    const match = script.match(/\bbreadcrumb\s*=\s*JSON\.parse\('([\s\S]*?)'\)/);
    if (!match) {
        throw new Error('Yicai category page has no channel breadcrumb');
    }
    const breadcrumb: unknown = JSON.parse(match[1]);
    // Preserve the source channel ID's existing positive-integer validation range.
    // oxlint-disable-next-line unicorn-js/prefer-number-is-safe-integer
    if (!Array.isArray(breadcrumb) || breadcrumb[0]?.[1] !== section || !Array.isArray(breadcrumb[1]) || typeof breadcrumb[1][0] !== 'string' || !Number.isInteger(breadcrumb[1][1]) || breadcrumb[1][1] <= 0) {
        throw new Error('Yicai category page has an invalid channel breadcrumb');
    }
    return { id: breadcrumb[1][1], name: breadcrumb[1][0] };
}
async function getChannel(section: 'news' | 'video', id: string, limit: number): Promise<Channel> {
    const response = await got({ method: 'get', url: `${rootUrl}/api/ajax/getnavs` });
    const navigation: unknown = response.data.header?.[section];
    if (Array.isArray(navigation)) {
        const channel = navigation.find((entry) => entry.EnglishName === id || String(entry.ChannelID) === id);
        if (channel && isOneOf(typeof channel.ChannelID, ['string', 'number']) && typeof channel.ChannelName === 'string' && typeof channel.EnglishName === 'string') {
            return { id: channel.ChannelID, name: channel.ChannelName, slug: channel.EnglishName };
        }
        throw new InvalidParameterError(`Unknown Yicai ${section} channel: ${id}`);
    }
    if (typeof navigation !== 'string') {
        throw new TypeError('Yicai channel navigation has an unsupported format');
    }
    const channels = getNavigationChannels(navigation, section);
    const channel = channels.find((entry) => entry.slug === id);
    if (channel) {
        const page = await got({ method: 'get', url: channel.url });
        return { ...getBreadcrumbChannel(page.data, section), slug: channel.slug };
    }
    if (/^[1-9]\d*$/.test(id)) {
        const result = await got({ method: 'get', url: `${rootUrl}/api/ajax/getlistbycid?cid=${id}&page=1&pagesize=${limit}` });
        const items: SourceArticle[] = result.data;
        if (!Array.isArray(items)) {
            throw new TypeError('Yicai channel API has an unsupported format');
        }
        const record = items.find((item) => String(item.ChannelID) === id && typeof item.ChannelName === 'string');
        const channel = record && channels.find((entry) => entry.name === record.ChannelName);
        if (channel) {
            return { id, name: record.ChannelName, slug: channel.slug, items };
        }
    }
    throw new InvalidParameterError(`Unknown Yicai ${section} channel: ${id}`);
}
const processItems = async (apiUrl: string, suppliedItems?: SourceArticle[]) => {
    const sourceItems: SourceArticle[] = suppliedItems ?? (await got({ method: 'get', url: apiUrl })).data;
    const items: ListedArticleItem[] = sourceItems.map((item) => {
        const mainVideo = getVideo(item.VideoUrl);
        return {
            title: item.NewsTitle,
            link: item.url.startsWith('http') ? item.url : `${rootUrl}${item.AppID === 0 ? '/vip' : ''}${item.url}`,
            author: item.NewsAuthor || item.NewsSource || item.CreaterName,
            pubDate: getPublicationDate(item.CreateDate),
            category: [item.ChannelName],
            description: renderDescription({
                image: {
                    src: item.originPic,
                    alt: item.NewsTitle,
                },
                video: mainVideo,
                intro: item.NewsNotes,
            }),
            mainVideo,
            poster: item.originPic,
        };
    });
    return fetchFullArticles(items);
};
async function fetchArticleDetails(link: string): Promise<ArticleDetails> {
    const detailResponse = await got({ method: 'get', url: link });
    const content = load(detailResponse.data);
    const pubDate = getArticleDate(content);
    const main = content('.multiText, #multi-text, .txt').first();
    if (new URL(link).pathname.startsWith('/topic/')) {
        const heading = main.children('h1').first();
        if (heading.text() === content('title').text()) {
            heading.remove();
        }
    }
    content('.u-btn6, .m-smallshare, .topic-hot, .topic-hot1').remove();
    const videoUrls = main
        .find('video[src], video source[src]')
        .toArray()
        .flatMap((node) => {
            const src = content(node).attr('src');
            if (!src) {
                return [];
            }
            try {
                return [new URL(src, link).href];
            } catch {
                return [];
            }
        });
    return { description: main.html() ?? '', pubDate, videoUrls };
}
function fetchFullArticles(items: ListedArticleItem[]): Promise<ArticleItem[]> {
    return pMap(
        items,
        async (listedItem) => {
            const { mainVideo, poster, ...item } = listedItem;
            const details = await cache.tryGet<ArticleDetails>(`yicai:article:v4:${item.link}`, () => fetchArticleDetails(item.link));
            const media = mainVideo && !details.videoUrls.includes(new URL(mainVideo.src).href) ? renderDescription({ video: mainVideo, image: { src: poster } }) : '';
            return {
                ...item,
                pubDate: item.pubDate ?? details.pubDate,
                description: details.description ? media + details.description : item.description,
            };
        },
        { concurrency: 3, stopOnError: false }
    );
}
export { fetchFullArticles, getChannel, getVideo, processItems, rootUrl };
function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
