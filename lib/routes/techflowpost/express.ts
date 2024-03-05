// @ts-nocheck
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { unescapeAll } from 'markdown-it/lib/common/utils.mjs';

export default async (ctx) => {
    const rootUrl = 'https://www.techflowpost.com';
    const apiRootUrl = 'https://data.techflowpost.com';
    const currentUrl = `${rootUrl}/express`;
    const apiUrl = `${apiRootUrl}/api/pc/express/all?pageIndex=0&pageSize=${ctx.req.query('limit') ?? 50}`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            createTime: [],
        },
    });

    const items = response.data.content.map((item) => ({
        title: item.title,
        link: `${rootUrl}/express/${item.id}`,
        category: item.tags?.split('，') ?? [],
        pubDate: timezone(parseDate(item.createTime), +8),
        description: unescapeAll(item.content),
    }));

    ctx.set('data', {
        title: '深潮TechFlow - 快讯',
        link: currentUrl,
        item: items,
    });
};
