import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/update',
    categories: ['anime'],
    example: '/zaimanhua/update',
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
            source: ['manhua.zaimanhua.com/update'],
            target: '/update',
        },
    ],
    name: '最近更新',
    maintainers: ['kjasn'],
    handler: async () => {
        const baseUrl = 'https://manhua.zaimanhua.com';
        const currentUrl = `${baseUrl}/api/v1/comic2/update_list?status&theme&zone&cate&firstLetter&sortType&page=1&size=20`;

        const response = await ofetch(currentUrl, {
            headers: {
                'user-agent': config.trueUA,
                referer: baseUrl,
            },
        });

        const data = response.data.comicList;
        const items = data.map((item) => ({
            title: item.name,
            author: item.author,
            link: `${baseUrl}/view/${item.comic_py}/${item.id}/${item.last_update_chapter_id}`,
            image: item.cover,
            description: `[${item.status}] | ${item.name} - ${item.last_update_chapter_name}`,
            category: [item.status, ...item.types.split('/').map((type) => type.trim())],
            pubDate: parseDate(item.last_updatetime * 1000),
        }));

        return {
            title: '再漫画 - 最近更新',
            link: `${baseUrl}/update`,
            item: items,
        };
    },
};
