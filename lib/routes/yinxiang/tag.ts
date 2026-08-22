import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tag/:id',
    categories: ['study'],
    example: '/yinxiang/tag/人生算法',
    parameters: { id: '标签名，可在标签页中找到' },
    name: '笔记标签',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const apiUrl = `https://app.yinxiang.com/third/discovery/client/restful/public/tag/note?pageSize=20&tagName=${id}`;
    const response = await ofetch(apiUrl);

    const list = response.blogNote.map((item) => ({
        title: item.title,
        link: item.noteGuid,
        author: item.userNickname,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(`https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${item.link}`);

                item.link = `https://www.yinxiang.com/everhub/note/${item.link}`;
                item.pubDate = parseDate(Number(detailResponse.blogNote.publishTime));

                const description = detailResponse.blogNote.htmlContent;
                item.description = description.includes('<?xml') ? description.match(/<en-note>(.*)<\/en-note>/)[1] : description;

                return item;
            })
        )
    );

    return {
        title: `${response.tagInfo.name} - 印象识堂`,
        link: `https://www.yinxiang.com/everhub/tagtheme/${id}`,
        item: items,
    };
}
