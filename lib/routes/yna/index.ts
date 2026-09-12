import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import timezone from '@/utils/timezone';

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

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'ko';
    const channel = ctx.req.param('channel') ?? 'news';
    let url;
    switch (lang) {
        case 'ko':
            url = `https://www.yna.co.kr/rss/${channel}.xml`;
            break;
        default:
            url = `https://${lang}.yna.co.kr/RSS/${channel}.xml`;
            break;
    }

    const feed = await parser.parseURL(url);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet<DataItem>(item.link!, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const article = $('article.story-news');
                article.find('.related-group').remove();
                article.find('.writer-zone01').remove();

                return {
                    title: item.title!,
                    link: item.link,
                    pubDate: lang === 'ko' ? parseDate(item.pubDate!) : timezone(parseDate(item.pubDate!), 9),
                    author:
                        item.creator ??
                        $('.tit-name')
                            .toArray()
                            .map((c) => $(c).text())
                            .join(', '),
                    description: article.html(),
                };
            })
        )
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        language: feed.language ?? lang,
        item: items,
    };
}
