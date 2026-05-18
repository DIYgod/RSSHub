import type { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const link = 'https://www.technologyreview.com/topic/artificial-intelligence/';
const apiUrl = 'https://wp.technologyreview.com/wp-json/irving/v1/data/topic_feed';

export const route: Route = {
    path: '/ai',
    categories: ['new-media'],
    example: '/technologyreview/ai',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Artificial Intelligence',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['www.technologyreview.com/topic/artificial-intelligence/'],
            target: '/technologyreview/ai',
        },
    ],
    handler,
};

type IrvingComponent = {
    name?: string;
    config?: Record<string, any>;
    children?: IrvingComponent[];
    feedPosts?: IrvingComponent[];
    featuredPost?: IrvingComponent;
    featuredImage?: IrvingComponent;
};

export async function handler(ctx) {
    const limit = getLimit(ctx);
    const response = (await ofetch(buildApiUrl(), {
        headers: commonHeaders,
    })) as IrvingComponent[];

    const root = response[0] ?? {};
    const posts = [root.featuredPost, ...(root.feedPosts ?? [])].filter(Boolean) as IrvingComponent[];
    const items = posts
        .map((post, index) => normalizePost(post, index === 0 ? root.featuredImage : undefined))
        .filter(Boolean)
        .filter(dedupeByLink())
        .slice(0, limit);

    return {
        title: 'MIT Technology Review - Artificial Intelligence',
        link,
        description: 'Artificial intelligence coverage from MIT Technology Review.',
        item: items,
    };
}

function buildApiUrl() {
    const url = new URL(apiUrl);

    url.searchParams.set('page', '1');
    url.searchParams.set('orderBy', 'date');
    url.searchParams.set('topic', '9');
    url.searchParams.set('requestType', 'topic');

    return url.toString();
}

function normalizePost(post: IrvingComponent, imageComponent?: IrvingComponent) {
    const config = post.config ?? {};
    const href = config.link || config.url || config.href;
    const title = normalizeText(config.hed || config.title || config.name);

    if (!href || !title) {
        return;
    }

    const itemLink = new URL(href, link).href;
    const image = findImage(imageComponent) || findImage(post);
    const description = buildDescription(config.dek || config.description || '', image);
    const category = findTopic(post);
    const pubDate = parseDateFromUrl(itemLink);

    return {
        title,
        link: itemLink,
        guid: config.postId ? String(config.postId) : itemLink,
        description,
        ...(category ? { category } : {}),
        ...(pubDate ? { pubDate } : {}),
    };
}

function findImage(component?: IrvingComponent): string | undefined {
    if (!component) {
        return;
    }

    const config = component.config ?? {};
    const image = config.src || config.url || config.image?.src || config.image?.url;

    if (image && !String(image).startsWith('data:')) {
        return new URL(String(image), link).href;
    }

    for (const child of component.children ?? []) {
        const childImage = findImage(child);

        if (childImage) {
            return childImage;
        }
    }
}

function findTopic(component: IrvingComponent): string | undefined {
    const topic = component.children
        ?.map((child) => child.config?.topicText)
        .find((value) => value);

    return topic ? normalizeText(String(topic)) : undefined;
}

function parseDateFromUrl(itemLink: string) {
    const match = /\/(\d{4})\/(\d{2})\/(\d{2})\//.exec(itemLink);

    if (!match) {
        return;
    }

    const [, year, month, day] = match;
    return parseDate(`${year}-${month}-${day}`);
}

function dedupeByLink() {
    const seen = new Set<string>();

    return (item) => {
        if (seen.has(item.link)) {
            return false;
        }

        seen.add(item.link);
        return true;
    };
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 20;

    return Number.isFinite(limit) && limit > 0 ? limit : 20;
}

function normalizeText(value?: string) {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

function buildDescription(description: string, image?: string) {
    const parts = [];

    if (image) {
        parts.push(`<p><img src="${escapeAttribute(image)}" referrerpolicy="no-referrer"></p>`);
    }

    if (description) {
        parts.push(description);
    }

    return parts.join('\n');
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string) {
    return escapeHtml(value).replace(/"/g, '&quot;');
}

const commonHeaders = {
    referer: link,
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
