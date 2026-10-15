import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
            source: ['book.douban.com/subject/:id/discussion'],
            target: '/:id/discussion',
        },
    ],
    name: '读书论坛',
    maintainers: ['nightmare-mio'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = 'https://book.douban.com/subject';
    const { data: response } = await got(`${link}/${id}/discussion/`);
    const $ = load(response);
    // First-page discussions.
    const list = $('#posts-table>tbody>tr')
        .slice(1)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            const date = $item.find('.time').text();
            return {
                title: a.attr('title')!,
                link: a.attr('href'),
                pubDate: date ? timezone(parseDate(date), 8) : undefined,
                author: $item.find('a').eq(1).text(),
            };
        });
    const title = $('#content>h1').text();

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                // Replies.
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
            }),
        { concurrency: 3 }
    );

    return {
        title,
        link: `${link}/${id}/discussion`,
        item: items,
    };
}
