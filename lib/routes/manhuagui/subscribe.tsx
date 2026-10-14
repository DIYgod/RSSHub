import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

const webUrl = 'https://www.manhuagui.com/user/book/shelf/1';

export const route: Route = {
    path: '/subscribe',
    categories: ['anime'],
    example: '/manhuagui/subscribe',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'MHGUI_COOKIE',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['www.mhgui.com/user/book/shelf'],
        },
    ],
    name: '漫画个人订阅',
    maintainers: ['shininome'],
    handler,
    url: 'www.mhgui.com/user/book/shelf',
    description: `::: tip
个人订阅需要自建
环境变量需要添加 MHGUI\\_COOKIE
:::`,
};

async function handler() {
    if (!config.manhuagui || !config.manhuagui.cookie) {
        throw new ConfigNotFoundError('manhuagui RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const cookie = config.manhuagui.cookie;
    const response = await got({
        method: 'get',
        url: webUrl,
        headers: {
            Cookie: cookie,
        },
    });
    const $ = load(response.data);
    const username = $('.avatar-box').find('h3').text();
    const title = `${username} 的 漫画订阅`;
    const link = webUrl;
    const description = `${username} 的 漫画订阅`;

    const item = $('.dy_content_li')
        .toArray()
        .map((item) => {
            const imageUrl = $(item).find('img').attr('src');
            const chapterTitle = $(item).find('.co_1.c_space').first().text();
            const title = $(item).find('img').attr('alt');
            const link = $(item).find('.co_1.c_space').first().children().attr('href');
            const description = renderToString(
                <>
                    <h1>{chapterTitle}</h1>
                    <img src={imageUrl} />
                </>
            );
            const pubDate = $(item).find('.co_1.c_space').first().next().text().trim();
            const publishDate = pubDate ? parseRelativeDate(pubDate) : undefined;
            const single = {
                title: title!,
                link,
                description,
                pubDate: publishDate,
            };
            return single;
        });
    return {
        title,
        link,
        description,
        item,
    };
}
