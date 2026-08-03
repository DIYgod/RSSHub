import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// http://www.2cycd.com/forum.php?mod=forumdisplay&fid=43&orderby=dateline

export const route: Route = {
    path: '/:fid/:sort?',
    categories: ['bbs'],
    example: '/2cycd/43/dateline',
    parameters: { fid: '板块', sort: '排序' },
    name: '板块',
    maintainers: ['shelken'],
    description: `板块（更多板块请自行 [查看](http://www.2cycd.com)）

| 音乐下载（默认） | 动漫下载 | 游戏下载 |
| ---------------- | -------- | -------- |
| 43               | 53       | 42       |

排序

| 发布时间排序（默认） | 回复／查看 | 查看  |
| -------------------- | ---------- | ----- |
| dateline             | replies    | views |`,
    handler,
};

async function handler(ctx) {
    const fid = ctx.req.param('fid') ?? '43';
    const sort = ctx.req.param('sort') ?? 'dateline';

    const rootUrl = 'http://www.2cycd.com/forum.php?mod=forumdisplay';
    const currentUrl = `${rootUrl}&fid=${fid}&orderby=${sort}`;

    const response = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gbk'));

    const list = $('tbody[id^="normalthread_"]')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const xst = $item.find('a.s.xst');
            const author = $item.find('td.by cite a').eq(0).text();
            return {
                title: xst.text(),
                link: xst.attr('href'),
                author,
            };
        });
    // console.log(list);
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got(item.link, {
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, 'gbk'));
                const first_post = content('td[id^="postmessage_"]').first();
                const dateobj = content('em[id^="authorposton"]').first();
                item.description = first_post.html();
                item.pubDate = timezone(parseDate(dateobj.find('span').attr('title')!, 'YYYY-M-D HH:mm:ss'), 8);

                return item;
            })
        )
    );
    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
