import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
/*
 * @Author: nightmare-mio wanglongwei2009@qq.com
 * @Date: 2023-11-20 23:36:12
 * @LastEditTime: 2023-11-22 20:11:24
 * @Description:
 */
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id/discussion',
    categories: ['social-media'],
    example: '/douban/36328704/discussion',
    parameters: { id: '书本id;默认论坛文章使用"按回应时间排序",仅第一页文章' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['book.douban.com/:id/discussion'],
        },
    ],
    name: '豆瓣读书论坛',
    maintainers: ['nightmare-mio'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = 'https://book.douban.com/subject';
    const { data: response } = await got(`${link}/${id}/discussion/`);
    const $ = load(response);
    // 列表
    const list = $('#posts-table>tbody>tr')
        .toArray()
        .slice(1)
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.attr('title'),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.time').text()),
                author: item.find('a').eq(1).text(),
            };
        });
    const title = $('#content>h1').text();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                // 评论
                const list = $('#comments>.comment-item').toArray();
                const replyContent = list
                    .map((item, index) => {
                        const post = $(item);
                        const content = post.find('.content>p').html();
                        const author = post.find('.author>a').text();
                        return `<p><div>#${index + 1}: <i>${author}</i></div><div>${content}</div></p>`;
                    })
                    .join('');
                item.description = `${$('#link-report>div').eq(1).html()}<div>${replyContent}</div>`;
                return item;
            })
        )
    );

    return {
        title,
        link: `${link}/${id}/discussion`,
        item: items,
    };
}
