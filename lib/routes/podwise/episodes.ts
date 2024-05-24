import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/explore/:type',
    categories: ['multimedia'],
    example: '/podwise/explore/latest',
    parameters: { type: 'latest or all episodes.' },
    radar: [
        {
            source: ['podwise.ai/explore/:type'],
        },
    ],
    name: 'Episodes',
    maintainers: ['lyling'],
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const link = `https://podwise.ai/explore/${type}`;
        const response = await ofetch(link);
        const $ = load(response);
        const content = $('#navigator').next();
        // header/[div => content]/footer, content>div(2)>h1
        const title = content.find('h1').first().text();
        const description = content.find('p').eq(1).text();

        const list = content
            .find('.group')
            .toArray()
            .map((item) => {
                item = $(item);
                const title = item.find('a').first().text();
                const link = item.find('a').first().attr('href');
                const description = item.find('p').first().text();
                const author = item.children('div').last().children('div').first().text();
                const pubDate = item.find('a').next().children('span').text();

                return {
                    title,
                    link: `https://podwise.ai${link}`,
                    description,
                    author,
                    pubDate: timezone(parseDate(pubDate, 'DD MMM YYYY', 'en'), 8),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    item.description = $('summary').first().html();
                    return item;
                })
            )
        );

        return {
            title,
            description,
            link,
            item: items,
        };
    },
};
