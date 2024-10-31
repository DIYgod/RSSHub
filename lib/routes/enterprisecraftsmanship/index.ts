import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/archives',
    categories: ['blog'],
    example: '/enterprisecraftsmanship/archives',
    radar: [
        {
            source: ['enterprisecraftsmanship.com/archives/'],
        },
    ],
    url: 'enterprisecraftsmanship.com/',
    name: 'Archives',
    maintainers: ['liyaozhong'],
    handler,
    description: 'Enterprise Craftsmanship blog archives',
};

async function handler() {
    const rootUrl = 'https://enterprisecraftsmanship.com';
    const currentUrl = `${rootUrl}/archives`;

    const response = await got(currentUrl);

    const $ = load(response.data);

    let items = $('.postIndexItem')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('.title a').text().trim();
            const link = new URL($item.find('.title a').attr('href'), currentUrl).href;
            const dateStr = $item.find('.date').text().trim();
            const pubDate = parseDate(dateStr);

            return {
                title,
                link,
                pubDate,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got(item.link);
                    const $detail = load(detailResponse.data);

                    // 获取 .post 内容，但排除 .post-info
                    item.description = ($detail('.post > .paragraph').html() ?? '') + ($detail('.post >.sect1').html() ?? '');

                    return item;
                } catch (error) {
                    logger.error(`处理文章 ${item.link} 时发生错误: ${error}`);
                    return item;
                }
            })
        )
    );

    return {
        title: 'Enterprise Craftsmanship - Archives',
        link: currentUrl,
        item: items,
    };
}
