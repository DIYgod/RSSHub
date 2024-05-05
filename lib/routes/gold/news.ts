import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { load } from 'cheerio'; // 类似 jQuery 的 API HTML 解析器
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    name: '新闻与活动',
    maintainers: ['BiosSun'],
    example: '/news',
    categories: ['finance'],

    radar: [
        {
            source: ['china.gold.org'],
            target: '/news',
        },
    ],

    handler: async () => {
        const domain = 'china.gold.org';
        const url = `https://${domain}/news`;

        const response = await ofetch(url);
        const $ = load(response);

        const list = $('main article wgc-card')
            .toArray()
            .map((item) => {
                const el = $(item);
                const title = el.find('h3').text().trim();
                const link = `https://${domain}${el.find('a').attr('href')!}`;
                const pubDate = el.find('.wgc-field-publication-date').text().trim();

                return {
                    title,
                    link,
                    pubDate: pubDate ? timezone(parseDate(pubDate, ['YYYY年MM月DD日']), 0) : undefined,
                    description: '',
                };
            });

        const items = await Promise.all(
            list.map(
                (item) =>
                    cache.tryGet(item.link, async () => {
                        const response = await ofetch(item.link);
                        const $ = load(response);
                        return {
                            ...item,
                            description: $('main section.field-main-content').html() || $('main .wgc-text').html() || '',
                        };
                    }) as Promise<typeof item>
            )
        );

        return {
            // 源标题
            title: `World Gold Council News & Events`,
            // 源链接
            link: url,
            // 源文章
            item: items,
        };
    },
};
