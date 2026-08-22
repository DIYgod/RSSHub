import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://my.4399.com';

export const route: Route = {
    path: '/forums/:mtag',
    categories: ['game'],
    example: '/4399/forums/mtag-83932',
    parameters: { mtag: '论坛网址最后的 mtag 字段' },
    name: '论坛',
    maintainers: ['lwgpshit'],
    features: {
        requireConfig: [
            {
                name: 'GAME_4399',
                description: '对应登录后的 cookie 值，获取方式：1. 在 4399 首页登录. 2. 打开开发者工具，切换到 Network 面板. 3. 刷新 4. 查找`www.4399.com`的访问请求，点击请求，在右侧 Headers 中找到 Cookie.',
            },
        ],
    },
    radar: [
        {
            source: ['my.4399.com/forums/:mtag'],
        },
    ],
    handler,
};

async function handler(ctx: Context) {
    const { mtag } = ctx.req.param();
    const cookie = config.game4399.cookie;
    if (!cookie) {
        throw new ConfigNotFoundError('4399 forum RSS is disabled due to the lack of GAME_4399 config');
    }

    const response = await ofetch(`${baseUrl}/forums/${mtag}`, {
        headers: { Cookie: cookie },
    });
    const $ = load(response);

    const fname = $('div.about .title').text();
    const list = $('li div.listtitle')
        .toArray()
        .map((item) => {
            const $item = $(item).parent();
            return {
                title: $item.find('div.title').text() + '    ---------------最后回复->' + $item.find('.rtime span').text() + ':' + $item.find('.rtime a').text().trim(),
                link: baseUrl + $item.find('.thread_link').attr('href'),
                author: $item.find('.author').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, {
                    headers: { Cookie: cookie },
                });
                const content = load(detailResponse);
                content('div.host_content.j-thread-content img').not('.post_emoji').remove();

                const timeText = content('.host_title p')
                    .text()
                    .match(/发表于\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}|\S+前)/)?.[1];

                return {
                    ...item,
                    description: content('div.host_content.j-thread-content').html(),
                    pubDate: timeText && (timeText.endsWith('前') ? parseRelativeDate(timeText) : timezone(parseDate(timeText), 8)),
                };
            })
        )
    );

    return {
        title: `${fname}群组`,
        link: `${baseUrl}/forums/${mtag}`,
        item: items,
    };
}
