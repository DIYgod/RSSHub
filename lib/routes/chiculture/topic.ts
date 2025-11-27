import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/topic/:category?',
    categories: ['new-media'],
    example: '/chiculture/topic',
    parameters: { category: '分类，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '議題熱話',
    maintainers: ['nczitzk'],
    handler,
    description: `| 全部 | 現代中國 | 今日香港 | 全球化 | 一周時事通識 |
| ---- | -------- | -------- | ------ | ------------ |
|      | 76       | 479      | 480    | 379          |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') || '';

    const rootUrl = 'https://ls.chiculture.org.hk';
    const currentUrl = `${rootUrl}/api/general-listing?lang=zh-hant&type=ssrh&category=${category}&page=1`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        pubDate: item.tags,
        link: `${rootUrl}${item.url}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                const pubDate = detailResponse.data.match(/上載日期：(.*)<\/p>/);

                if (pubDate) {
                    item.pubDate = parseDate(pubDate[1]);
                } else if (item.title.includes('一周時事通識')) {
                    for (const tag of item.pubDate) {
                        if (/^\d{4}年$/.test(tag.title)) {
                            const monthDayStr = item.title.split('- ')[1] ?? item.title.split('-')[1];
                            item.pubDate = timezone(parseDate(monthDayStr, 'D/M'), +8);
                            break;
                        }
                    }
                } else if (/^\d{4}年新聞回顧$/.test(item.title)) {
                    item.pubDate = parseDate(`${item.title.split('年')[0]}-12-31`);
                } else {
                    item.pubDate = '';
                }

                item.description = content('#article_main_content').html();

                return item;
            })
        )
    );

    return {
        title: '議題熱話 | 通識·現代中國',
        link: `${rootUrl}/tc/hot-topics${category ? `?category=${category}` : ''}`,
        item: items,
    };
}
