import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/geekdaily',
    categories: ['new-media', 'popular'],
    example: '/rebase/geekdaily',
    radar: [
        {
            source: ['rebase.network/geekdaily'],
            target: '/geekdaily',
        },
    ],
    name: 'Web3 Geek Daily',
    maintainers: ['gaoyifan'],
    handler: async () => {
        const response = await ofetch('https://db.rebase.network/api/v1/geekdailies?sort=id:desc');
        const data = response.data;

        const items = data.map((item) => ({
            title: item.attributes.title,
            link: item.attributes.url,
            description: item.attributes.introduce,
            pubDate: parseDate(item.attributes.time),
            author: item.attributes.author,
        }));

        return {
            title: 'Web3 Geek Daily',
            link: 'https://rebase.network/geekdaily',
            item: items,
        };
    },
};
