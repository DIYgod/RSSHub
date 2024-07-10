import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/global/jlpt',
    name: '日本语能力测试(JLPT)通知',
    url: 'jlpt.neea.edu.cn',
    maintainers: ['nczitzk'],
    example: '/neea/global/jlpt',
    parameters: {},
    categories: ['study'],
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['jlpt.neea.edu.cn', 'jlpt.neea.cn'],
            target: '/global/jlpt',
        },
    ],
    handler,
};

async function handler() {
    const rootUrl = 'https://news.neea.cn';
    const currentUrl = `${rootUrl}/JLPT/1/newslist.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a')
        .toArray()
        .map((item) => {
            item = $(item);

            const matches = item.text().match(/(\d{4}-\d{2}-\d{2})/);

            return {
                title: item.text(),
                link: `${rootUrl}/JLPT/1/${item.attr('href')}`,
                pubDate: matches ? timezone(parseDate(matches[1]), +8) : '',
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

                item.description = content('.dvContent').html();

                return item;
            })
        )
    );

    return {
        title: '日本语能力测试(JLPT)通知',
        link: currentUrl,
        item: items,
    };
}
