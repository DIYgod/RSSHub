import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/2yuan/news/:id?',
    categories: ['university'],
    example: '/xjtu/2yuan/news',
    parameters: { id: '编号，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '第二附属医院新闻',
    maintainers: ['nczitzk'],
    handler,
    description: `| 分类     | 编号 |
| -------- | ---- |
| 通知公告 | 110  |
| 综合新闻 | 6    |
| 科室动态 | 8    |
| 教学动态 | 45   |
| 科研动态 | 51   |
| 护理动态 | 57   |
| 党群活动 | 63   |
| 外事活动 | 13   |
| 媒体二院 | 14   |
| 理论政策 | 16   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '110';

    const rootUrl = 'http://2yuan.xjtu.edu.cn';
    const currentUrl = `${rootUrl}/Html/News/Columns/${id}/Index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.column_list h2')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${rootUrl}${item.find('a').attr('href')}`,
                pubDate: timezone(parseDate(item.find('.dy_date').text()), +8),
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

                item.description = content('#zoom').html();
                item.pubDate = timezone(
                    parseDate(
                        content('.sub_tit3 strong')
                            .first()
                            .text()
                            .replace(/发布时间：/, '')
                    ),
                    +8
                );

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
