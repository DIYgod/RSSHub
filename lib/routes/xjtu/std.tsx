import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/std/:category?',
    categories: ['university'],
    example: '/xjtu/std/zytz',
    parameters: { category: '分类，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '科技在线',
    maintainers: ['nczitzk'],
    handler,
    description: `| 通知公告 | 重要通知 | 项目申报 | 成果申报 | 信息快讯 |
| -------- | -------- | -------- | -------- | -------- |
|          | zytz     | xmsb     | cgsb     | xxkx     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'http://std.xjtu.edu.cn';
    const currentUrl = `${rootUrl}/tzgg${category ? `/${category}` : ''}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.c1017')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = renderToString(<XjtuStdDescription description={content('#vsb_newscontent').html()} attachments={content('#vsb_newscontent').parent().next().next().next().html()} />);
                item.pubDate = timezone(parseDate(content('#vsb_newscontent').parent().prev().prev().text().split('&nbsp')[0], 'YYYY年MM月DD日 HH:mm'), +8);

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

const XjtuStdDescription = ({ description, attachments }: { description?: string; attachments?: string }) => (
    <>
        {description ? raw(description) : null}
        {attachments ? raw(attachments) : null}
    </>
);
