// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const titles = {
    1: '新闻',
    3: '公告',
};

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '1';

    const rootUrl = 'https://gf-cn.sunborngame.com';
    const apiRootUrl = 'https://gfcn-webserver.sunborngame.com';
    const apiUrl = `${apiRootUrl}/website/news_list/${category}?page=0&limit=${ctx.req.query('limit') ?? 50}`;
    const currentUrl = `${rootUrl}/News`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.list.map((item) => ({
        guid: item.Id,
        title: item.Title,
        link: `${rootUrl}/NewsInfo?id=${item.Id}`,
        pubDate: timezone(parseDate(item.Date), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${apiRootUrl}/website/news/${item.guid}`,
                });

                item.description = detailResponse.data.data.Content.replaceAll('<img src="', '<img src="https://gf-cn.cdn.sunborngame.com/website/cms/');

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${titles[category]} - 少女前线 - 情报局`,
        link: currentUrl,
        item: items,
    });
};
