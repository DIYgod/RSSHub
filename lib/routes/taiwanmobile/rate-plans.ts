import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/rate-plans',
    categories: ['other'],
    example: '/taiwanmobile/rate-plans',
    radar: [
        {
            source: ['taiwanmobile.com/cs/public/servAnn/queryList.htm'],
        },
    ],
    name: '資費公告',
    maintainers: ['Tsuyumi25'],
    handler,
    url: 'www.taiwanmobile.com/cs/public/servAnn/queryList.htm?type=1',
};

async function handler() {
    const baseUrl = 'https://www.taiwanmobile.com';
    const listUrl = `${baseUrl}/cs/public/servAnn/queryList.htm?type=1`;
    const response = await ofetch(listUrl);

    const $ = load(response);

    const list = $('.pagination_data')
        .toArray()
        .map((item) => {
            const element = $(item);
            const title = element.find('a').text().trim();
            const link = new URL(element.find('a').attr('href') ?? '', baseUrl).href;
            const pubDate = parseDate(element.find('td').first().text(), 'YYYY/MM/DD');

            return {
                title,
                link,
                pubDate,
            };
        })
        .slice(0, 20);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                return {
                    ...item,
                    description: content('.v2-page-change__current').find('.v2-uikit__typography-text.-h3, .v2-m-faq-card__description.gray.pad_btm1').remove().end().html() || '暫無內容',
                };
            })
        )
    );

    return {
        title: '台灣大哥大 - 資費公告',
        link: listUrl,
        item: items as DataItem[],
    };
}
