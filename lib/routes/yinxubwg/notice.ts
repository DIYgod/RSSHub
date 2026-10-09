import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

export const route = {
    path: '/notice',
    categories: ['travel'],
    example: '/yinxubwg/notice',
    name: 'Notice',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.yinxubwg.cn/yxgw/notice'],
            target: '/notice',
        },
    ],
    handler: async () => {
        const cate = 1;
        const baseUrl = 'https://www.yinxubwg.cn';
        const apiBaseUrl = 'https://guc.yinxubwg.cn';
        const museumName = namespace.zh?.name || namespace.name;

        const response = await ofetch(`${apiBaseUrl}/gwebapi/article/list`, {
            query: {
                p: 'w',
                cate_id: cate,
                page: 1,
                limit: 9,
            },
        });

        const list: Array<{
            article_id: number;
            title: string;
            push_time_new: string;
            out_url: string;
        }> = response.data?.list ?? [];

        const items = list.map((item) => ({
            title: item.title,
            link: item.out_url || `${baseUrl}/yxgw/notice/detail?id=${item.article_id}&cate=${cate}&pos=news`,
            pubDate: parseDate(item.push_time_new),
        }));

        return {
            title: `${museumName} - 最新公告`,
            link: `${baseUrl}/yxgw/notice?cate=${cate}`,
            language: 'zh-CN',
            item: items,
        };
    },
};
