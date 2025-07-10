import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/sh',
    categories: ['traditional-media'],
    example: '/eastday/sh',
    parameters: {},
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
            source: ['sh.eastday.com/'],
        },
    ],
    name: '上海新闻',
    maintainers: ['saury'],
    handler,
    url: 'sh.eastday.com/',
};

async function handler() {
    const domain = 'http://wap.eastday.com';

    const response = await got({
        method: 'get',
        url: `https://apin.eastday.com/apiplus/special/specialnewslistbyurl?specialUrl=1632798465040016&skipCount=0&limitCount=20`,
    });

    const result = await Promise.all(
        response.data.data.list.map(async (item) => {
            const link = item.url;
            const entity = {
                title: item.title,
                description: item.abstracts,
                pubDate: timezone(parseDate(item.time), +8),
                link,
            };

            try {
                const cacheKey = `eastday_sh_${link}`;
                entity.description = await cache.tryGet(cacheKey, async () => {
                    const article = await got({
                        method: 'get',
                        url: link,
                    });
                    // 解析html内容
                    const $ = load(article.body);
                    return $('.article_wrapper .mainLayer .content').html() || $('.contentBox .article .detail').html();
                });
            } catch (error) {
                logger.error(error);
            }

            return entity;
        })
    );

    return {
        title: `东方网-上海`,
        link: `${domain}/wap/sh.html`,
        item: result,
    };
}
