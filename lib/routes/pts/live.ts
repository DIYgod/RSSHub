// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const rootUrl = 'https://news.pts.org.tw';
    const currentUrl = `${rootUrl}/live/${id}`;
    const apiUrl = `${rootUrl}/live/api/liveblog/${id}`;
    const imageRootUrl = 'https://dkjm35kkdt2ag.cloudfront.net';

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.blogArticleList.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30).map((item) => ({
        link: `${rootUrl}/live/api/liveblog/article?articleId=${item}&model=main`,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const data = detailResponse.data.data;

                item.title = data.title;
                item.pubDate = parseDate(data.updatedDate);
                item.description = art(path.join(__dirname, 'templates/live.art'), {
                    images: data.content.filter((d) => d.type === 'img').map((i) => `${imageRootUrl}/${i.imgFileUrl}`),
                    texts: data.content.filter((d) => d.type === 'text').map((t) => t.content),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `公視新聞網 PNN - ${response.data.data.title.replace(/【不斷更新】/, '')}`,
        link: currentUrl,
        item: items,
    });
};
