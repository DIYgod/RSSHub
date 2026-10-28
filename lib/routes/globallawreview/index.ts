import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/',
    categories: ['journal'],
    example: '/globallawreview',
    radar: [
        {
            source: ['globallawreview.org/Magazine/GetIssueContentList', 'globallawreview.org/'],
            target: '',
        },
    ],
    name: '期刊',
    maintainers: ['nczitzk'],
    handler,
    url: 'globallawreview.org/Magazine/GetIssueContentList',
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'http://www.globallawreview.org';

    const { data: firstResponse } = await got(rootUrl);

    let $ = load(firstResponse);

    const issueHref = $('p.tabBtn span a').prop('href');
    if (!issueHref) {
        throw new Error('Global Law Review did not provide a current issue link. The source may be returning an access review page; retry when anonymous access is available.');
    }
    const currentUrl = new URL(issueHref, rootUrl).href;

    const { data: response } = await got(currentUrl);

    $ = load(response);

    const items = $('ul.digest li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);

            const a = $item.find('p.p1 a');
            const link = new URL(a.prop('href')!, rootUrl).href;

            return {
                title: a.text(),
                link,
                description: $item.find('p.p2').html(),
                author: $item.find('p.p3 span').text() || a.text().split('：', 1)[0],
                category: [
                    $item
                        .find('p.p4')
                        .text()
                        .match(/\] (\d+\.\d+);/)![1],
                ],
                enclosure_url: link,
                enclosure_length:
                    Number(
                        $item
                            .find('p.p4')
                            .text()
                            .match(/(\d+(\.\d+)?)\sKB/)![1]
                    ) * 1000,
            };
        });

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        language: 'zh-CN' as const satisfies Language,
        author: '中国社会科学院法学研究所',
    };
}
