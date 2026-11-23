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
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

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
    const redirectPath = refresh?.split('url=', 2)[1];
    if (redirectPath) {
        const destination = new URL(redirectPath, link);
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
    const author = modernBody.children().first().find('a[href^="/blog/authors/"]').last();
    const authorHref = author.attr('href');
    const description = modernBody
        .children('.cms-markdown, div[class="mb-8"]')
        .toArray()
        .map((element) => $(element).html())
        .join('');
    return {
        item: {
            description,
            category: modernBody
                .find('a[href^="/blog/tags/"], a[href^="/blog/categories/"]')
                .toArray()
                .map((element) => $(element).text()),
            author: [{ name: author.text(), url: authorHref ? new URL(authorHref, baseUrl).href : undefined }],
            content: { html: description },
        },
    };
};

const enrichItem = async (item: DataItem): Promise<DataItem> => {
    const detail = await cache.tryGet(`thebrain:blog:v2:${item.link}`, () => fetchDetails(item.link!));
    if (detail.redirect) {
        const destination = detail.redirect;
        let description = item.description;
        if (destination.description && destination.headlines.some((headline) => normalizeHeadline(headline) === normalizeHeadline(item.title))) {
            const body = load(destination.description, null, false);
            const headings = body('h1, h2').slice(0, 2);
            if (normalizeHeadline(headings.first().text()) === normalizeHeadline(item.title)) {
                headings.first().remove();
            } else if (
                normalizeHeadline(
                    headings
                        .toArray()
                        .map((element) => body(element).text())
                        .join(' ')
                ) === normalizeHeadline(item.title)
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
    };
};

const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 30);

    const targetUrl: string = new URL('blog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('h4 > a[href^="/blog/"]')
        .closest('div.flex.flex-row')
        .slice(0, limit)
        .toArray()
        .filter((el) => isTag(el))
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h4 a');

            const title: string = $aEl.text();
            const imageSrc = $el.find('img').attr('src');
            const image = imageSrc ? new URL(imageSrc, baseUrl).href : undefined;
            const summary = $el.find('.cms-markdown').html();
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
            const linkUrl: string | undefined = $aEl.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                pubDate: parseDate($el.find('h4 + p').text(), 'MMM D, YYYY', 0),
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
