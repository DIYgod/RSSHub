import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/gzmtu/jwc',
    name: '教务处通知公告',
    maintainers: ['skyedai910'],
    handler,
};

async function handler(): Promise<Data> {
    const link = 'https://jwc.gzmtu.edu.cn/';
    const response = await ofetch(link);
    const $ = load(response);

    const items = await Promise.all(
        $('div .center_article_list')
            .find('td a')
            .toArray()
            .map((item) => new URL($(item).attr('href')!, link).href)
            .map((itemUrl) =>
                cache.tryGet(itemUrl, async () => {
                    const response = await ofetch(itemUrl);
                    const $ = load(response);

                    $('img, div, span, p, table, td, tr').removeAttr('style');
                    $('style, script').remove();

                    return {
                        title: $('h2').text(),
                        author: '广州航海学院教务处',
                        link: itemUrl,
                        pubDate: timezone(parseDate($('div[id=articleInfo]').text().slice(5, 15)), 8),
                        description: $('div .body').html(),
                        guid: itemUrl,
                    };
                })
            )
    );

    return {
        title: '广州航海学院教务处通知公告',
        description: '广州航海学院教务处教务通知、教务动态、教务简报 RSS by SkYe231',
        link,
        item: items,
        language: 'zh-CN',
    };
}
