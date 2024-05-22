import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/explore/:type',
    categories: ['multimedia', 'programming'],
    example: '/podwise/explore/latest',
    parameters: { type: 'latest or all episodes.' },
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
                    link,
                    description,
                    author,
                    pubDate,
                };
            });

        const items = list.map((item) => ({
            title: item.title,
            link: `https://podwise.ai${item.link}`,
            description: item.description,
            author: item.author,
            pubDate: timezone(parseDate(item.pubDate, 'DD MMM YYYY', 'en'), 8),
        }));

        return {
            title,
            description,
            item: items,
        };
    },
};
