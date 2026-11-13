import { load } from 'cheerio';
import { decodeHTML } from 'entities';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const BASE_URL = 'https://newsroom.arm.com';
const API_BASE = `${BASE_URL}/wp-json/wp/v2`;
const SITE_DESCRIPTION = "Stay informed with Arm's top stories, insights, and conversations.";

interface WpTopic {
    id: number;
    name: string;
    slug: string;
    link: string;
}

interface WpAuthor {
    name?: string;
    code?: string;
}

interface WpFeaturedMedia {
    id?: number;
    source_url?: string;
    alt_text?: string;
    caption?: { rendered?: string };
    code?: string;
}

interface WpTerm {
    name?: string;
    code?: string;
}

interface WpPost {
    id: number;
    date_gmt: string;
    modified_gmt: string;
    link: string;
    title: { rendered: string };
    content?: { rendered?: string };
    excerpt?: { rendered?: string };
    featured_media?: number;
    _embedded?: {
        author?: WpAuthor[];
        'wp:featuredmedia'?: WpFeaturedMedia[];
        'wp:term'?: Array<WpTerm[] | { code?: string }>;
    };
}

const api = <T>(endpoint: string, query: Record<string, string | number>) =>
    ofetch<T>(`${API_BASE}/${endpoint}`, {
        query,
    });

const decodeText = (value: string) =>
    decodeHTML(value)
        .replaceAll(/[\u{200B}-\u{200D}\u{FEFF}]/gu, '')
        .replaceAll('\u{00A0}', ' ');

const cleanText = (value: string) => decodeText(value).trim();

const mediaStem = (url: string) => {
    const pathname = new URL(url, BASE_URL).pathname;
    const filename = pathname.slice(pathname.lastIndexOf('/') + 1);
    return filename.replace(/-(?:scaled|\d+x\d+)(?=\.[^.]+$)/, '').replace(/\.[^.]+$/, '');
};

const renderBody = (post: WpPost, featured?: WpFeaturedMedia) => {
    const rawHtml = post.content?.rendered || post.excerpt?.rendered || '';
    const $ = load(rawHtml, null, false);

    $('script, style').remove();
    $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src?.startsWith('http://')) {
            $(el).attr('src', src.replace(/^http:\/\//, 'https://'));
        }
    });

    const featuredUrl = featured?.source_url?.replace(/^http:\/\//, 'https://');
    if (featuredUrl) {
        const stem = mediaStem(featuredUrl);
        const alreadyInBody =
            (post.featured_media && $(`img.wp-image-${post.featured_media}`).length > 0) ||
            (stem !== '' &&
                $('img')
                    .toArray()
                    .some((el) => {
                        const src = $(el).attr('src') ?? '';
                        const srcset = $(el).attr('srcset') ?? '';
                        return src.includes(stem) || srcset.includes(stem);
                    }));

        if (!alreadyInBody) {
            const $figure = $('<figure></figure>');
            const $img = $('<img>').attr('src', featuredUrl);
            const alt = featured?.alt_text?.trim();
            if (alt) {
                $img.attr('alt', alt);
            }
            $figure.append($img);

            const captionHtml = featured?.caption?.rendered?.trim();
            if (captionHtml) {
                const $caption = $('<figcaption></figcaption>').html(captionHtml);
                $figure.append($caption);
            }

            return `${$.html($figure)}${$.html()}`;
        }
    }

    return $.html();
};

const toDataItem = (post: WpPost): DataItem => {
    const featured = post._embedded?.['wp:featuredmedia']?.find((media) => !media.code && media.source_url && (post.featured_media ? media.id === post.featured_media : true));

    const authors = (post._embedded?.author ?? [])
        .filter((author) => !author.code && typeof author.name === 'string')
        .map((author) => cleanText(author.name!))
        .filter((name) => name !== '' && name.toLowerCase() !== 'anonymous');

    const categories = [
        ...new Set(
            (post._embedded?.['wp:term'] ?? [])
                .filter((group): group is WpTerm[] => Array.isArray(group))
                .flat()
                .filter((term) => !term.code && typeof term.name === 'string')
                .map((term) => cleanText(term.name!))
                .filter(Boolean)
        ),
    ];

    const featuredUrl = featured?.source_url?.replace(/^http:\/\//, 'https://');

    return {
        title: decodeText(post.title.rendered),
        link: post.link,
        description: renderBody(post, featured),
        pubDate: parseDate(`${post.date_gmt}Z`),
        updated: parseDate(`${post.modified_gmt}Z`),
        author: authors.length > 0 ? authors.map((name) => ({ name })) : undefined,
        category: categories.length > 0 ? categories : undefined,
        image: featuredUrl,
    };
};

export const TOPIC_TABLE_EN = `| Topic | Slug |
| --- | --- |
| Artificial Intelligence (AI) | \`artificial-intelligence\` |
| Automotive and autonomous machines | \`automotive-autonomous-machines\` |
| Cloud computing | \`cloud-computing\` |
| Company news | \`company\` |
| Gaming | \`gaming\` |
| High-performance computing | \`hpc\` |
| Internet of Things (IoT) | \`internet-of-things\` |
| Investor news | \`investor\` |
| Network infrastructure | \`network-infrastructure\` |
| PCs and laptops | \`pc-laptops\` |
| Reports | \`reports\` |
| Robotics | \`robotics\` |
| Security | \`security\` |
| Silicon | \`silicon\` |
| Smartphones | \`smartphones\` |
| Software | \`software\` |
| Sustainability and social impact | \`sustainability-and-social-impact\` |
| Wearables | \`wearables\` |`;

export const TOPIC_TABLE_ZH = `| 专题 | Slug |
| --- | --- |
| 人工智能（AI） | \`artificial-intelligence\` |
| 汽车与自动驾驶 | \`automotive-autonomous-machines\` |
| 云计算 | \`cloud-computing\` |
| 公司新闻 | \`company\` |
| 游戏 | \`gaming\` |
| 高性能计算（HPC） | \`hpc\` |
| 物联网（IoT） | \`internet-of-things\` |
| 投资者新闻 | \`investor\` |
| 网络基础设施 | \`network-infrastructure\` |
| PC 与笔记本 | \`pc-laptops\` |
| 报告 | \`reports\` |
| 机器人 | \`robotics\` |
| 安全 | \`security\` |
| 芯片与硅技术 | \`silicon\` |
| 智能手机 | \`smartphones\` |
| 软件 | \`software\` |
| 可持续发展与社会影响 | \`sustainability-and-social-impact\` |
| 可穿戴设备 | \`wearables\` |`;

export const fetchNewsroomData = async (
    ctx: Context,
    options: {
        endpoint: 'news' | 'posts';
        titlePrefix: string;
        baseLink: string;
    }
): Promise<Data> => {
    const rawTopic = ctx.req.param('topic');
    const topicSlug = rawTopic && rawTopic !== 'all' ? rawTopic : undefined;

    const topic = topicSlug
        ? ((await cache.tryGet(`arm:newsroom:topic:${topicSlug}`, async () => {
              const topics = await api<WpTopic[]>('topics', {
                  slug: topicSlug,
                  _fields: 'id,name,slug,link',
              });
              if (topics.length === 0) {
                  throw new InvalidParameterError(`Topic "${topicSlug}" not found.`);
              }
              return {
                  id: topics[0].id,
                  name: cleanText(topics[0].name),
                  slug: topics[0].slug,
                  link: topics[0].link,
              };
          })) as WpTopic)
        : undefined;

    const limit = Math.min(Math.max(getRouteLimit(ctx, 20), 1), 100);
    const posts = await api<WpPost[]>(options.endpoint, {
        per_page: limit,
        _embed: 'wp:featuredmedia,wp:term,author',
        _fields: 'id,date_gmt,modified_gmt,link,title,content,excerpt,featured_media,_links,_embedded',
        ...(topic && { topics: topic.id }),
    });

    return {
        title: topic ? `${options.titlePrefix} - ${topic.name}` : options.titlePrefix,
        link: topic?.link ?? options.baseLink,
        description: SITE_DESCRIPTION,
        language: 'en',
        item: posts.map((post) => toDataItem(post)),
    };
};
