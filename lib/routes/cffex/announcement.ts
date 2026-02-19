import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/announcement',
    name: '交易所公告',
    url: 'www.cffex.com.cn',
    maintainers: ['ChenXiangcheng1'],
    example: '/cffex/announcement',
    parameters: {},
    description: '',
    categories: ['government'],
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
            source: ['cffex.com.cn'],
            target: '/announcement',
        },
    ],
    handler,
};

async function handler(): Promise<{ title: string; link: string; item: DataItem[] }> {
    const baseUrl = 'http://www.cffex.com.cn';
    const homeUrl = `${baseUrl}/jystz`;
    const response = await ofetch(homeUrl);

    // 使用 Cheerio 选择器解析 HTML
    const $ = load(response);
    const list = $('div.notice_list li')
        .toArray()
        .map((item) => {
            item = $(item); // (Element) -> LoadedCheerio
            const titleEle = $(item).find('a').first();
            const dateEle = $(item).find('a').eq(1);

            return {
                title: titleEle.text().trim(),
                link: `${baseUrl}${titleEle.attr('href')}`,
                pubDate: timezone(parseDate(dateEle.text(), 'YYYY-MM-DD'), +8),
            };
        });

    // (Promise) -> Promise
    const items = await Promise.all(
        // (Promise|null) -> Promise|null
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('div.jysggnr div.nan p').eq(1)?.html();
                return item;
            })
        )
    );

    return {
        title: '中国金融期货交易所 - 交易所公告',
        link: homeUrl,
        item: items,
    };
}
