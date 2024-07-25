import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/announcement',
    name: '中国金融期货交易所 - 交易所公告',
    url: 'www.cffex.com.cn',
    maintainers: ['ChenXiangcheng1'],
    example: '/cffex/announcement',
    parameters: {},
    description: `欢迎订阅!!! 我维护的 cffex 交易所公告!!! `,
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
            target: '/cffex/announcement',
        },
    ],
    handler,
};

async function handler(): Promise<{ title: string; link: string; item: DataItem[] }> {
    const baseUrl = 'http://www.cffex.com.cn';
    const homeUrl = `${baseUrl}/jystz`;
    const response = await ofetch(homeUrl, {
        headers: {},
    });

    // 使用 Cheerio 选择器解析 HTML
    const $ = load(response);
    const list = $('div.notice_list li')
        .toArray()
        .map((item) => {
            item = $(item); // (Element) -> LoadedCheerio
            const a1 = $(item).find('a').first();
            const a2 = $(item).find('a').eq(1);

            return {
                title: a1.text().trim(),
                link: `${baseUrl}${a1.attr('href')}`,
                pubDate: timezone(parseDate(a2.text(), 'YYYY-MM-DD'), +8),
            };
        });

    // (Promise) -> Promise
    const items = await Promise.all(
        // (Promise|null) -> Promise|null
        list.map((item) =>
            cache.tryGet(
                item.link,
                async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.description = $('div.jysggnr div.nan p').eq(1)?.html();
                    return item;
                },
                3600,
                true
            )
        )
    );

    return {
        title: `中国金融期货交易所 - 交易所公告`,
        link: homeUrl,
        item: items,
    };
}
