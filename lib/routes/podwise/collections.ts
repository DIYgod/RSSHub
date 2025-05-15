import { Route, ViewType } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库

export const route: Route = {
    path: '/explore',
    categories: ['multimedia', 'popular'],
    view: ViewType.Audios,
    example: '/podwise/explore',
    radar: [
        {
            source: ['podwise.ai', 'podwise.ai/explore'],
        },
    ],
    name: 'Collections',
    maintainers: ['lyling'],
    handler: async () => {
        const link = 'https://podwise.ai/explore';
        const response = await ofetch(link);
        const $ = load(response);
        const content = $('#navigator').next();
        // header/[div => content]/footer, content p(2)
        const collectinDescription = content.find('p').eq(1).text();

        const items = content
            .find('.group')
            .toArray()
            .map((item) => {
                item = $(item);
                const title = item.find('a').first().text();
                const link = item.find('a').first().attr('href');
                const description = item.find('p').first().text();
                return {
                    title,
                    link: `https://podwise.ai${link}`,
                    description,
                };
            });

        return {
            title: $('title').text(),
            description: collectinDescription,
            item: items,
            link,
        };
    },
};
