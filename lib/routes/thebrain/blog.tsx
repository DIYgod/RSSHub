import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import { isTag } from 'domhandler';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const parseCalendarDate = (value: string | undefined) => {
    const match = value && /^([A-Z]+) (\d{1,2}), (\d{4})$/i.exec(value);
    if (!match) {
        return;
    }
    const month = monthNames.indexOf(match[1].slice(0, 3).toLowerCase());
    if (month === -1) {
        return;
    }
    const timestamp = Date.UTC(Number(match[3]), month, Number(match[2]));
    return parseDate(new Date(timestamp));
};

function parseRedirectPath(refresh: string | undefined) {
    if (!refresh) {
        return refresh;
    }
    const prefix = /^\s*\d+(?:\.\d+)?\s*;\s*url\s*=(\s*)["']?/i.exec(refresh);
    if (!prefix) {
        return;
    }
    const remainder = refresh!.slice(prefix[0].length);
    if (!remainder) {
        return /\s$/.test(prefix[0]) ? prefix[0].at(-1) : prefix[1].at(-1);
    }
    const quoteIndex = remainder.search(/["']/);
    if (quoteIndex !== -1) {
        return quoteIndex > 0 && !remainder.slice(quoteIndex + 1).trim() ? remainder.slice(0, quoteIndex) : undefined;
    }
    return remainder.trimEnd() || remainder[0];
}

const baseUrl = 'https://www.thebrain.com';

interface BlogDetails {
    item?: Partial<DataItem>;
    redirect?: { link: string; headlines: string[]; description?: string };
}

const normalizeHeadline = (headline: string) => headline.replaceAll(/\s+/g, ' ').trim().toLowerCase();

const fetchDetails = async (link: string): Promise<BlogDetails> => {
    const response = await ofetch(link);
    const $ = load(response);
    const refresh = $('meta[http-equiv="refresh" i]').attr('content');
    const redirectPath = parseRedirectPath(refresh);
    if (redirectPath) {
        const destination = new URL(redirectPath, link);
        if (destination.protocol !== 'https:' && destination.protocol !== 'http:') {
            throw new Error('TheBrain blog redirect does not point to a web page.');
        }
        if (destination.origin !== baseUrl) {
            return { redirect: { link: destination.href, headlines: [] } };
        }
        const destinationResponse = await ofetch(destination.href);
        const destinationPage = load(destinationResponse);
        const main = destinationPage('main .cms-markdown');
        const headings = main.find('h1, h2').slice(0, 2);
        const headlines = [
            destinationPage('title')
                .text()
                .replace(/ - TheBrain$/, ''),
            headings.first().text(),
            headings
                .toArray()
                .map((element) => destinationPage(element).text())
                .join(' '),
        ];
        return {
            redirect: {
                link: destination.href,
                headlines,
                description: main
                    .toArray()
                    .map((element) => destinationPage(element).html())
                    .join(''),
            },
        };
    }

    const modernBody = $('main .cms-markdown').first().parent();
    if (modernBody.length) {
        const header = modernBody.children().first();
        const author = header.find('a[href^="/blog/authors/"]').last();
        const authorHref = author.attr('href');
        const description = modernBody
            .children('.cms-markdown, div[class="mb-8"]')
            .toArray()
            .map((element) => $(element).html())
            .join('');
        return {
            item: {
                title: modernBody.find('h2').first().text(),
                description,
                pubDate: parseCalendarDate(header.find('p').text()),
                category: modernBody
                    .find('a[href^="/blog/tags/"], a[href^="/blog/categories/"]')
                    .toArray()
                    .map((element) => $(element).text()),
                author: author.text() ? [{ name: author.text(), url: authorHref ? new URL(authorHref, baseUrl).href : undefined }] : undefined,
                content: { html: description },
            },
        };
    }

    const title = $('h2.gradient-heading').text() || $('h1.gradient-heading').text();
    $('h2.gradient-heading, div#shareDiv').remove();
    const description = ($('div.blog-content').html() || $('div.docs-section').html()) ?? undefined;
    const pubDateStr = $('div.blog-meta').text();
    const category = [
        ...new Set(
            $('a.under-category')
                .toArray()
                .map((element) => $(element).text())
                .filter(Boolean)
        ),
    ];
    const author = $('img.avatar')
        .toArray()
        .map((element) => {
            const authorElement = $(element).parent().next().find('a');
            const authorHref = authorElement.attr('href');
            const avatarSrc = $(element).attr('src');
            return {
                name: authorElement.text(),
                url: authorHref ? new URL(authorHref, baseUrl).href : undefined,
                avatar: avatarSrc ? new URL(avatarSrc.split(/\?/, 1)[0], baseUrl).href : undefined,
            };
        });
    return {
        item: {
            ...(title && { title }),
            ...(description && { description, content: { html: description } }),
            ...(pubDateStr && { pubDate: parseDate(pubDateStr) }),
            category,
            author,
        },
    };
};

const enrichItem = async (item: DataItem): Promise<DataItem> => {
    if (!item.link) {
        return item;
    }

    const detail = await cache.tryGet(`thebrain:blog:v2:${item.link}`, () => fetchDetails(item.link!));
    if (detail.redirect) {
        const destination = detail.redirect;
        let description = item.description;
        if (destination.description && destination.headlines.some((headline) => normalizeHeadline(headline) === normalizeHeadline(item.title ?? ''))) {
            const body = load(destination.description, null, false);
            const headings = body('h1, h2').slice(0, 2);
            if (normalizeHeadline(headings.first().text()) === normalizeHeadline(item.title ?? '')) {
                headings.first().remove();
            } else if (
                normalizeHeadline(
                    headings
                        .toArray()
                        .map((element) => body(element).text())
                        .join(' ')
                ) === normalizeHeadline(item.title ?? '')
            ) {
                headings.remove();
            }
            description = body.html();
        }
        return {
            ...item,
            guid: item.link,
            link: destination.link,
            description,
            content: { html: description },
        };
    }
    return {
        ...item,
        ...detail.item,
        title: item.title || detail.item?.title || '',
        pubDate: item.pubDate ?? detail.item?.pubDate,
    };
};

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 30);

    const targetUrl: string = new URL('blog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    const legacyRows = $('div.blog-row');
    const modern = !legacyRows.length;
    const rows = modern ? $('h4 > a[href^="/blog/"]').closest('div.flex.flex-row') : legacyRows;

    let items: DataItem[] = rows
        .slice(0, limit)
        .toArray()
        .filter(isTag)
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h4 a');

            const title: string = $aEl.text();
            const imageSrc = $el.find(modern ? 'img' : 'div.round-corner-images img').attr('src');
            const image = imageSrc ? (modern ? new URL(imageSrc, baseUrl).href : `https:${imageSrc.split(/\?/, 1)[0]}`) : undefined;
            const summary = $el.find(modern ? '.cms-markdown' : 'p.small-text + *').html();
            const description: string | undefined = renderToString(
                <>
                    {image ? (
                        <figure>
                            <img src={image} alt={title} />
                        </figure>
                    ) : null}
                    {summary ? raw(summary) : null}
                </>
            );
            const pubDateStr: string | undefined = $el.find(modern ? 'h4 + p' : 'p.small-text').text();
            const linkUrl: string | undefined = $aEl.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                pubDate: modern ? parseCalendarDate(pubDateStr) : pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                },
                image,
                banner: image,
                language,
            };

            return processedItem;
        });

    items = await pMap(items, enrichItem, { concurrency: 3, stopOnError: false });

    const logoSrc: string | undefined = $('img.navbar-logo').attr('src');

    return {
        title: $('title').text(),
        link: targetUrl,
        item: items,
        image: logoSrc ? new URL(logoSrc, baseUrl).href : undefined,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'www.thebrain.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/thebrain/blog',
    parameters: undefined,
    description: undefined,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.thebrain.com/blog'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
};
