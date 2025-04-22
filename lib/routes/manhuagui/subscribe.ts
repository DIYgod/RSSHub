import { Route } from '@/types';

import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
const web_url = 'https://www.manhuagui.com/user/book/shelf/1';

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
  环境变量需要添加 MHGUI\_COOKIE
:::`,
};

async function handler() {
    if (!config.manhuagui || !config.manhuagui.cookie) {
        throw new ConfigNotFoundError('manhuagui RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const cookie = config.manhuagui.cookie;
    const response = await got({
        method: 'get',
        url: web_url,
        headers: {
            Cookie: cookie,
        },
    });
    const $ = load(response.data);
    const user_name = $('.avatar-box').find('h3').text();
    const title = `${user_name} 的 漫画订阅`;
    const link = web_url;
    const description = `${user_name} 的 漫画订阅`;

    const item = $('.dy_content_li')
        .map(function () {
            const img_src = $(this).find('img').attr('src'); // 漫画的封面
            const manga_title = $(this).find('.co_1.c_space').first().text(); // 最新的一话题目
            const title = $(this).find('img').attr('alt'); // 漫画的名字
            const link = $(this).find('.co_1.c_space').first().children().attr('href'); // 漫画最新的链接
            const description = art(path.join(__dirname, 'templates/manga.art'), {
                manga_title,
                img_src,
            });
            const pubDate = $(this).find('.co_1.c_space').first().next().text();
            const publishDate = parseRelativeDate(pubDate); // 处理相对时间
            const single = {
                title,
                link,
                description,
                pubDate: publishDate,
            };
            return single;
        })
        .get(); // 这里获取数组= =
    return {
        title,
        link,
        description,
        item,
    };
}
