// @ts-nocheck
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { unescapeAll } from 'markdown-it/lib/common/utils.mjs';

export default async (ctx) => {
    const rootUrl = 'https://www.techflowpost.com';
    const apiRootUrl = 'https://data.techflowpost.com';
    const apiUrl = `${apiRootUrl}/api/pc/home/more?pageIndex=0&pageSize=${ctx.req.query('limit') ?? 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.content.map((item) => ({
        title: item.title,
        author: item.source,
        link: `${rootUrl}/article/${item.id}`,
        category: item.tagList.map((t) => t.name),
        pubDate: timezone(parseDate(item.createTime), +8),
        description: unescapeAll(item.content),
    }));

    ctx.set('data', {
        title: '深潮TechFlow',
        link: rootUrl,
        item: items,
    });
};
