import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';
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

    const response = await got(url);
    const feed = await parser.parseString(response.data);
    const items = await pMap(
        feed.items,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'author' | 'description'>>(`yna:article:${item.link}`, () => fetchArticleDetails(item.link!));
            return {
                title: item.title!,
                link: item.link,
                pubDate: parseDate(item.pubDate!),
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
