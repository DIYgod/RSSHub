import { load } from 'cheerio';
import type { Element } from 'domhandler';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const betaModes = new Set(['content', 'content_plus']);

export const route: Route = {
    path: '/:community/:mode?',
    categories: ['social-media'],
    example: '/locals/mattfradd',
    parameters: {
        community: 'Community slug from `locals.com/:community/feed`, subdomain name from `:community.locals.com/feed`, or `_` for the Locals home feed',
        mode: 'Optional feed mode. Supports `content` and `content_plus`',
    },
    description: 'Fetches Locals feed pages with an authenticated `auth_token` cookie. Use `content` or `content_plus` to target the beta content library views.',
    features: {
        requireConfig: [
            {
                name: 'LOCALS_AUTH_TOKEN',
                description: 'The value of the `auth_token` cookie after logging in to Locals',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['locals.com/:community/feed'],
            target: '/:community',
        },
    ],
    name: 'Feed',
    maintainers: ['luckycold'],
    handler,
};

function decodeAuthToken(authToken: string): { uuid?: string } {
    try {
        const [, payload] = authToken.split('.');
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

        return {
            uuid: decoded?.data?.uuid || decoded?.sub,
        };
    } catch {
        return {};
    }
}

function getFeedUrls(community: string, mode: string | undefined): string[] {
    if (community === '_') {
        return [`https://locals.com/_/feed${mode ? `?mode=${mode}` : ''}`];
    }

    const classicUrls = [`https://locals.com/${community}/feed${mode ? `?mode=${mode}` : ''}`, `https://${community}.locals.com/feed${mode ? `?mode=${mode}` : ''}`];
    const betaUrls = [`https://${community}.beta.locals.com/feed${mode ? `?mode=${mode}` : ''}`];

    return [...classicUrls, ...betaUrls];
}

function getRequestHeaders(authToken: string) {
    const { uuid } = decodeAuthToken(authToken);
    const cookies = [`auth_token=${authToken}`];

    if (uuid) {
        cookies.push(`uuid=${uuid}`);
    }

    return {
        Authorization: `Bearer ${authToken}`,
        Cookie: cookies.join('; '),
        'User-Agent': config.trueUA,
    };
}

function isLoginPage(html: string): boolean {
    return html.includes('Locals | Login') || html.includes('action="https://action/login-action"') || html.includes('/login?redirectTo=');
}

function extractBackgroundImage(style: string | undefined): string | undefined {
    if (!style) {
        return undefined;
    }

    return style.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
}

function extractDescription($: ReturnType<typeof load>, element: Element): string | undefined {
    const $element = $(element);
    const $content = $element.find('.content .formatted, .formatted, .post__content, .post-body').first().clone();

    $content.find('.title, h1, h2, h3').first().remove();

    const html = $content.html()?.trim();
    return html || undefined;
}

function extractLink($: ReturnType<typeof load>, element: Element, baseUrl: string): string | undefined {
    const $element = $(element);
    const rawLink =
        $element.attr('data-post-url') || $element.find('[data-post-url]').first().attr('data-post-url') || $element.find('.title a[href], a[href*="/post/"]').first().attr('href') || $element.find('a[href]').first().attr('href');

    if (!rawLink) {
        return undefined;
    }

    try {
        return new URL(rawLink, baseUrl).href;
    } catch {
        return undefined;
    }
}

function extractPubDate($: ReturnType<typeof load>, element: Element): string | undefined {
    const $element = $(element);
    const datetime = $element.find('time[datetime]').first().attr('datetime')?.trim();
    if (datetime) {
        return parseDate(datetime);
    }

    const title = $element
        .find('[title]')
        .filter((_, item) =>
            Boolean(
                $(item)
                    .attr('title')
                    ?.match(/\d{4}|\w+ \d{1,2}, \d{4}/)
            )
        )
        .first()
        .attr('title')
        ?.trim();
    return title ? parseDate(title) : undefined;
}

function extractImage($: ReturnType<typeof load>, element: Element, baseUrl: string): string | undefined {
    const $element = $(element);
    const rawImage = $element.find('img[src], img[data-src]').first().attr('src') || $element.find('img[src], img[data-src]').first().attr('data-src') || extractBackgroundImage($element.find('.video-preview').first().attr('style'));

    if (!rawImage) {
        return undefined;
    }

    try {
        return new URL(rawImage, baseUrl).href;
    } catch {
        return undefined;
    }
}

function extractItems(html: string, baseUrl: string, mode: string | undefined): DataItem[] {
    const $ = load(html);
    const seen = new Set<string>();

    return $('.post[data-post-url], .post.post_preview.wcontainer, article[data-post-url], [data-post-url][data-post-uid]')
        .toArray()
        .map((element) => {
            const link = extractLink($, element, baseUrl);
            if (!link || seen.has(link)) {
                return null;
            }

            seen.add(link);

            const title = $(element).find('.content .formatted .title, .formatted .title, .title, h1, h2, h3').first().text().trim() || $(element).find('a[href]').first().text().trim() || link;
            const description = extractDescription($, element);
            const image = extractImage($, element, baseUrl);
            const author = $(element).find('.author .name, .author-name, [data-author-name]').first().text().trim() || undefined;

            return {
                title,
                link,
                description,
                pubDate: extractPubDate($, element),
                author,
                category: mode ? [mode] : undefined,
                image,
            };
        })
        .filter((item): item is DataItem => Boolean(item?.link));
}

async function fetchFeedPage(url: string, authToken: string) {
    try {
        return await cache.tryGet(`locals:${url}`, () =>
            ofetch(url, {
                headers: getRequestHeaders(authToken),
                retryStatusCodes: [403],
            })
        );
    } catch {
        return;
    }
}

async function resolveFeedPage(urls: string[], authToken: string) {
    const responses = await Promise.all(urls.map(async (url) => ({ html: await fetchFeedPage(url, authToken), url })));

    for (const response of responses) {
        if (!response.html) {
            continue;
        }

        const { html, url } = response;
        if (isLoginPage(html)) {
            continue;
        }

        const items = extractItems(html, url, undefined);
        if (items.length > 0) {
            return {
                html,
                items,
                url,
            };
        }
    }

    throw new Error('Unable to access the Locals feed. Check that `LOCALS_AUTH_TOKEN` is valid and that your account can view this feed.');
}

async function handler(ctx) {
    const { community, mode } = ctx.req.param();

    if (!config.locals?.authToken) {
        throw new ConfigNotFoundError('Locals RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    if (mode && !betaModes.has(mode)) {
        throw new Error('Invalid Locals mode. Supported values are `content` and `content_plus`.');
    }

    const feedUrls = getFeedUrls(community, mode);
    const { html, items, url } = await resolveFeedPage(feedUrls, config.locals.authToken);
    const $ = load(html);

    return {
        title: $('title').first().text().trim() || `Locals - ${community}`,
        link: url,
        description: $('meta[name="description"]').attr('content')?.trim() || undefined,
        image: $('meta[property="og:image"]').attr('content')?.trim() || undefined,
        item: mode ? extractItems(html, url, mode) : items,
        allowEmpty: true,
    };
}
