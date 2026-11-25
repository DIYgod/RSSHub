import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

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
    CreateDate: string;
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
type BreadcrumbChannel = {
    id: number;
    name: string;
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
function getVideo(value?: string):
    | {
          src: string;
          type?: string;
      }
    | undefined {
    if (!value) {
        return;
    }
    const extension = new URL(value).pathname.match(/\.([a-z\d]+)$/i)?.[1].toLowerCase();
    return { src: value, type: extension ? videoMimeTypes.get(extension) : undefined };
}
function getArticleDate(content: CheerioAPI): Temporal.Instant | undefined {
    const dataScript = content("script[src='/js/alert.min.js']").next().text() || content('title').next().text();
    const match = dataScript.match(/_pb = (\[.*?\]);/);
    if (!match) {
        return;
    }
    const pb = new Map(JSON.parse(match[1].replaceAll("'", '"')));
    return parseDate(`${pb.get('actime')}:00`);
}
function getNavigationChannels(html: string): NavigationChannel[] {
    const content = load(html);
    return content('li > a[href]')
        .toArray()
        .map((node) => {
            const anchor = content(node);
            const url = new URL(anchor.attr('href')!, rootUrl);
            return { name: anchor.text(), slug: url.pathname.split('/', 3)[2], url: url.href };
        });
}
function getBreadcrumbChannel(html: string): BreadcrumbChannel {
    const match = /\bbreadcrumb\s*=\s*JSON\.parse\('([\s\S]*?)'\)/.exec(html);
    if (!match) {
        throw new Error('Yicai category page has no channel breadcrumb');
    }
    const breadcrumb = JSON.parse(match[1]);
    return { id: breadcrumb[1][1], name: breadcrumb[1][0] };
}
async function getChannel(section: 'news' | 'video', id: string, limit: number): Promise<Channel> {
    const response = await got({ method: 'get', url: `${rootUrl}/api/ajax/getnavs` });
    const channels = getNavigationChannels(response.data.header[section]);
    const channel = channels.find((entry) => entry.slug === id);
    if (channel) {
        const page = await got({ method: 'get', url: channel.url });
        return { ...getBreadcrumbChannel(page.data), slug: channel.slug };
    }
    if (/^[1-9]\d*$/.test(id)) {
        const result = await got({ method: 'get', url: `${rootUrl}/api/ajax/getlistbycid?cid=${id}&page=1&pagesize=${limit}` });
        const items: SourceArticle[] = result.data;
        const record = items.find((item) => String(item.ChannelID) === id);
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
            pubDate: parseDate(item.CreateDate, 8),
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
    const main = content('.multiText, #multi-text, .txt');
    if (new URL(link).pathname.startsWith('/topic/')) {
        const heading = main.children('h1');
        if (heading.text() === content('title').text()) {
            heading.remove();
        }
    }
    content('.u-btn6, .m-smallshare, .topic-hot, .topic-hot1').remove();
    const videoUrls = main
        .find('video[src], video source[src]')
        .toArray()
        .map((node) => new URL(content(node).attr('src')!, link).href);
    return { description: main.html(), pubDate, videoUrls };
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
