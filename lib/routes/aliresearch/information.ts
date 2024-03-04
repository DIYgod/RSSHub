// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? '新闻';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'http://www.aliresearch.com';
    const currentUrl = `${rootUrl}/cn/information`;
    const apiUrl = `${rootUrl}/ch/listArticle`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            pageNo: 1,
            pageSize: 10,
            type,
        },
    });

    let items = response.data.data.slice(0, limit).map((item) => ({
        title: item.articleCode,
        author: item.author,
        pubDate: timezone(parseDate(item.gmtCreated), +8),
        link: `${rootUrl}/ch/information/informationdetails?articleCode=${item.articleCode}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: `${rootUrl}/ch/getArticle`,
                    json: {
                        articleCode: item.title,
                    },
                });

                const data = detailResponse.data.data;

                item.title = data.title;
                item.description = data.content;
                item.category = data.special.split(',');

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `阿里研究院 - ${type}`,
        link: currentUrl,
        item: items,
    });
};
