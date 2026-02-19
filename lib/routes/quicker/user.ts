import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/user/:category/:id',
    categories: ['programming'],
    example: '/quicker/user/Actions/3-CL',
    parameters: { category: '分类，见下表', id: '用户 id，可在对应用户页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户更新',
    maintainers: ['Cesaryuan', 'nczitzk'],
    handler,
    description: `| 动作    | 子程序      | 动作单      |
| ------- | ----------- | ----------- |
| Actions | SubPrograms | ActionLists |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const id = ctx.req.param('id');

    const rootUrl = 'https://getquicker.net';
    const currentUrl = `${rootUrl}/User/${category}/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('table tbody tr')
        .slice(1, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            item = $(item).find('td a').first();

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                content('section').last().remove();
                content('#app').children().slice(0, 2).remove();

                const pubDate = content('.text-secondary a').not('.text-secondary').first().text()?.trim().replaceAll(/\s*/g, '') || content('div.note-text').find('span').eq(3).text();

                item.author = content('.user-link').first().text();
                item.description = content('div[data-info="动作信息"]').html() ?? content('#app').html() ?? content('.row').eq(1).html();
                item.pubDate = timezone(/-/.test(pubDate) ? parseDate(pubDate) : parseRelativeDate(pubDate), +8);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
}
