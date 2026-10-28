import { Buffer } from 'node:buffer';

import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rssEncodings = new Set<BufferEncoding>(['ascii', 'utf8', 'utf16le', 'ucs2', 'base64', 'latin1', 'binary', 'hex']);
const rssEncodingAliases = { 'utf-8': 'utf8', 'iso-8859-1': 'latin1' } satisfies Record<string, BufferEncoding>;
const isRssEncodingAlias = (key: string): key is keyof typeof rssEncodingAliases => Object.hasOwn(rssEncodingAliases, key);

export const getRssFeed = async (feedUrl: string, redirectCount = 0): Promise<Awaited<ReturnType<typeof parser.parseString>>> => {
    const response = await ofetch.raw<ArrayBuffer, 'arrayBuffer'>(feedUrl, {
        method: 'GET',
        headers: { Accept: 'application/rss+xml', 'User-Agent': config.ua },
        responseType: 'arrayBuffer',
        redirect: 'manual',
        ignoreResponseError: true,
        timeout: config.requestTimeout,
    });
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
        if (redirectCount === 5) {
            throw new Error('Too many redirects');
        }
        return getRssFeed(new URL(location, feedUrl).href, redirectCount + 1);
    }
    if (response.status >= 300) {
        throw new Error(`Status code ${response.status}`);
    }
    const charset =
        response.headers
            .get('content-type')
            ?.match(/(encoding|charset)\s*=\s*(\S+)/)?.[2]
            .toLowerCase() || '';
    const encoding = (isRssEncodingAlias(charset) && rssEncodingAliases[charset]) || (rssEncodings.has(charset as BufferEncoding) ? (charset as BufferEncoding) : 'utf8');
    return parser.parseString(Buffer.from(response._data!).toString(encoding));
};

const ProcessImage = ($, e) => {
    const photo = $(e).find('figure').find('picture').find('img');

    let cover = `<figure><img src='${photo.attr('src')}'><br><figcaption>`;

    const caption = $(e).find('figcaption');

    cover += `${$(caption[0]).text().trim()}</figcaption></figure>`;

    return cover;
};

const PuppeterGetter = async (ctx, context, link) => {
    const result = await cache.tryGet(`nyt: ${link}`, async () => {
        const page = await context.newPage();
        try {
            await page.route('**/*', (route) => {
                const request = route.request();
                request.resourceType() === 'document' ? route.continue() : route.abort();
            });
            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });
            return await page.evaluate(() => document.querySelector('body')!.getHTML());
        } finally {
            await page.close();
        }
    });
    return result;
};

const ProcessFeed = (data, hasEnVersion = false) => {
    const $ = load(data);

    let content;
    const result: Pick<DataItem, 'description' | 'title' | 'author' | 'pubDate'> = { title: '' };

    // 处理 www.nytimes.com
    if (hasEnVersion) {
        content = $('section[name="articleBody"]');
        result.title = `「英」${$('h1').text()}`;
        result.author = $('article#story span[itemprop="name"]').text();

        // 处理封面图片
        $('article#story > header')
            .find('div[data-testid="photoviewer-wrapper"]')
            .each((i, e) => {
                const cover = ProcessImage($, e);

                $(cover).insertBefore(content[0].firstChild);
            });

        // 处理图片
        content.find('div[data-testid="photoviewer-wrapper"]').each((i, e) => {
            const cover = ProcessImage($, e);
            $(cover).insertBefore(e);
            $(e).remove();
        });

        // remove ad
        content.find('#CNB').remove();
        // remove useless DOMs
        content.find('aside').each((i, e) => {
            $(e).remove();
        });
    }
    // 处理 cn.nytimes.com
    else {
        content = $('section.article-body');

        // remove useless DOMs
        content.find('div.big_ad, div.article-body-aside').each((i, e) => {
            $(e).remove();
        });

        // divide paragraphs with <p>
        content.find('div.article-paragraph').each((i, e) => {
            $(e).html(`<p>${$(e).html()}</p>`);
        });

        if ($('figure.article-span-photo').length > 0) {
            // there is a cover photo
            const cover = $('figure.article-span-photo');
            $(cover).insertBefore(content[0].firstChild);
        }
    }

    const time = $('time').attr('datetime');
    if (time) {
        result.pubDate = parseDate(time);
    }

    result.description = content.html();

    return result;
};

export default { ProcessFeed, PuppeterGetter };
