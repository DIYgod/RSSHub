import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/:lang?/:channel?',
    categories: ['traditional-media'],
    example: '/yna/en/national',
    parameters: {
        lang: 'Language, see below, `ko` by default',
        channel: 'RSS Feed Channel, see below, `news` by default',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        requireConfig: false,
    },
    name: 'News',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    description: `| Language | 한국어 | English | 简体中文 | 日本語 | عربي | Español | Français |
| -------- | ------ | ------- | -------- | ------ | ---- | ------- | -------- |
| \`:lang\`  | \`ko\`   | \`en\`    | \`cn\`     | \`jp\`   | \`ar\` | \`es\`    | \`fr\`     |

For a full list of RSS Feed Channels, please refer to the RSS feed page of the corresponding language

| RSS Feed Page                                             |
| --------------------------------------------------------- |
| [한국어](https://www.yna.co.kr/rss/index?site=footer_rss) |
| [English](https://en.yna.co.kr/channel/index)             |
| [简体中文](https://cn.yna.co.kr/channel/index)            |
| [日本語](https://jp.yna.co.kr/channel/index)              |
| [عربي](https://ar.yna.co.kr/channel/index)                |
| [Español](https://sp.yna.co.kr/channel/index)             |
| [Français](https://fr.yna.co.kr/channel/index)            |

::: tip
For example, the path for the RSS feed url <https://www.yna.co.kr/rss/economy.xml> and <https://cn.yna.co.kr/RSS/news.xml> would be \`/ko/economy\` and \`/cn/news\` respectively.
:::`,
};

async function fetchFeed(url: string, redirectCount = 0): Promise<string> {
    let status = 0;
    let location: string | null = null;
    let contentType = '';
    const response = await got(url, {
        responseType: 'buffer',
        redirect: 'manual',
        retry: 0,
        timeout: 60000,
        ignoreResponseError: true,
        headers: {
            'User-Agent': config.ua,
            Accept: 'application/rss+xml',
        },
        onResponse({ response }) {
            status = response.status;
            location = response.headers.get('location');
            contentType = response.headers.get('content-type') ?? '';
        },
    });

    if (status >= 300 && status < 400 && location) {
        if (redirectCount === 5) {
            throw new Error('Too many redirects');
        }
        return fetchFeed(new URL(location, url).href, redirectCount + 1);
    }
    if (status >= 300) {
        throw new Error(`Status code ${status}`);
    }

    const charset = contentType.match(/(encoding|charset)\s*=\s*(\S+)/)?.[2]?.toLowerCase() ?? '';
    const encoding = charset === 'utf-8' ? 'utf8' : charset === 'iso-8859-1' ? 'latin1' : charset;
    const supportedEncodings = ['ascii', 'utf8', 'utf16le', 'ucs2', 'base64', 'latin1', 'binary', 'hex'];
    return response.body.toString(supportedEncodings.includes(encoding) ? (encoding as BufferEncoding) : 'utf8');
}

function parsePublicationDate(value: string | undefined): Date | undefined {
    if (typeof value !== 'string' || !value.trim()) {
        return;
    }
    const date = parseDate(value);
    if (Number.isFinite(date.getTime())) {
        return date;
    }
    return;
}

async function fetchArticleDetails(link: string): Promise<Pick<DataItem, 'author' | 'description'>> {
    const response = await got(link);
    const $ = load(response.data);
    const article = $('article.story-news');
    article.find('.related-group').remove();
    article.find('.writer-zone01').remove();

    return {
        author: $('.tit-name')
            .toArray()
            .map((item) => $(item).text())
            .join(', '),
        description: article.html(),
    };
}

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'ko';
    const channel = ctx.req.param('channel') ?? 'news';

    if (!isValidHost(lang)) {
        throw new InvalidParameterError('Invalid lang');
    }

    let url;
    switch (lang) {
        case 'ko':
            url = `https://www.yna.co.kr/rss/${channel}.xml`;
            break;
        default:
            url = `https://${lang}.yna.co.kr/RSS/${channel}.xml`;
            break;
    }

    const feed = await parser.parseString(await fetchFeed(url));
    const items = await pMap(
        feed.items,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'author' | 'description'>>(`yna:article:${item.link}`, () => fetchArticleDetails(item.link!));
            return {
                title: item.title!,
                link: item.link,
                pubDate: parsePublicationDate(item.pubDate),
                author: item.creator ?? details.author,
                description: details.description,
            };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        language: feed.language ?? lang,
        item: items,
    };
}
