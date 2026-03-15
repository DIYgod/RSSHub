import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://hk.on.cc';

const languageMap = {
    'zh-hans': '_cn',
    'zh-hant': '',
};

const channelMap = {
    news: {
        'zh-hans': '港澳',
        'zh-hant': '港澳',
    },
    cnnews: {
        'zh-hans': '两岸',
        'zh-hant': '兩岸',
    },
    intnews: {
        'zh-hans': '国际',
        'zh-hant': '國際',
    },
    commentary: {
        'zh-hans': '评论',
        'zh-hant': '評論',
    },
    finance: {
        'zh-hans': '产经',
        'zh-hant': '產經',
    },
};

export const route: Route = {
    path: '/:language/:channel?',
    categories: ['traditional-media'],
    example: '/oncc/zh-hant/news',
    parameters: { language: '`zh-hans` 为简体，`zh-hant` 为繁体', channel: '频道，默认为港澳' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '即時新聞',
    maintainers: ['Fatpandac'],
    handler,
    description: `频道参数可以从官网的地址中获取，如：

  \`https://hk.on.cc/hk/finance/index_cn.html\` 对应 \`/oncc/zh-hans/finance\`

  \`https://hk.on.cc/hk/finance/index.html\` 对应 \`/oncc/zh-hant/finance\``,
};

async function handler(ctx) {
    const language = ctx.req.param('language');
    const channel = ctx.req.param('channel') ?? 'news';
    const newsUrl = `${rootUrl}/hk/${channel}/index${languageMap[language]}.html`;

    const response = await got.get(newsUrl);
    const $ = load(response.data);
    const list = $('#focusNews > div.focusItem[type=article]')
        .toArray()
        .map((item) => {
            const title = $(item).find('div.focusTitle > span').text();
            const link = rootUrl + $(item).find('a:nth-child(1)').attr('href');
            const pubDate = parseDate($(item).attr('edittime'), 'YYYYMMDDHHmmss');

            return {
                title,
                link,
                pubDate,
            };
        });

    const items = await Promise.all(
        list.map(async (item) => {
            const desc = await cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const $ = load(detailResponse.data);
                const imageUrl = rootUrl + $('img').eq(0).attr('src');
                const content = $('div.breakingNewsContent').html();
                const description = renderArticleDescription({
                    imageUrl,
                    content,
                });

                return description;
            });
            item.description = desc;

            return item;
        })
    );

    return {
        title: `東網 - ${channelMap[channel][language]}`,
        link: newsUrl,
        item: items,
    };
}

const renderArticleDescription = ({ imageUrl, content }: { imageUrl: string; content?: string }): string =>
    renderToString(
        <>
            <img src={imageUrl} />
            {content ? raw(content) : null}
        </>
    );
