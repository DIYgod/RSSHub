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
        category: item.tags.map((tag) => tag.title),
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

                const uploadDate = content('#article_main_content')
                    .text()
                    .match(/上載日期[：:]\s*(\d{4}年\d{1,2}月(?:\d{1,2}日)?)/)?.[1];
                let pubDate: Date | undefined;

                if (uploadDate) {
                    pubDate = timezone(parseDate(uploadDate, ['YYYY年M月D日', 'YYYY年M月'], true), 8);
                } else if (item.title.includes('一周時事通識')) {
                    const year = item.category.find((tag) => /^\d{4}年$/.test(tag))?.slice(0, 4);
                    const monthDay = item.title.match(/\d{1,2}\/\d{1,2}\s*-\s*(\d{1,2}\/\d{1,2})/)?.[1];
                    if (year && monthDay) {
                        pubDate = timezone(parseDate(`${year} ${monthDay}`, 'YYYY D/M', true), 8);
                    }
                } else if (/^\d{4}年新聞回顧$/.test(item.title)) {
                    pubDate = timezone(parseDate(`${item.title.split('年', 1)[0]}-12-31`, 'YYYY-MM-DD', true), 8);
                }

                return {
                    ...item,
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                    description: content('#article_main_content').html(),
                };
            })
        )
    );

    return {
        title: '議題熱話 | 通識·現代中國',
        link: `${rootUrl}/tc/hot-topics${category ? `?category=${category}` : ''}`,
        item: items,
    };
}
