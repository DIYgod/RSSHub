// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://gs.sustech.edu.cn';
    const link = `${baseUrl}/#/common/index?current_id=99&id=99`;
    const response = await got(`${baseUrl}/api/www/v1/article/list`, {
        searchParams: {
            page: 1,
            pageSize: 20,
            kw: '',
            sort_id: 99,
            cas_sort_id: 99,
        },
    });

    const list = response.data.data.items.map((item) => ({
        title: item.title,
        link: `${baseUrl}/#/common/detail?current_id=99&id=99&article_id=${item.id}`,
        pubDate: parseDate(item.published_at, 'YYYY-MM-DD'),
    }));

    ctx.set('data', {
        title: '南方科技大学研究生院',
        link,
        description: '南方科技大学研招网通知公告',
        item: list,
    });
};
