import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/note',
    categories: ['study'],
    example: '/yinxiang/note',
    name: '印象剪藏',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const apiUrl = 'https://app.yinxiang.com/third/discovery/client/restful/public/v2/discovery/homepage?notePageSize=20';
    const response = await ofetch(apiUrl);

    const list = response.blogNote.slice(0, 5).map((item) => ({
        title: item.title,
        link: `https://www.yinxiang.com/everhub/note/${item.noteGuid}`,
        pubDate: parseDate(Number(item.publishTime)),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(`https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${item.link.split('/note/', 2)[1]}`);

                const description = detailResponse.blogNote.htmlContent;
                item.description = description.includes('<?xml') ? description.match(/<en-note>(.*)<\/en-note>/)[1] : description;

                return item;
            })
        )
    );

    return {
        title: '印象剪藏 - 印象识堂',
        link: 'https://www.yinxiang.com/everhub/',
        item: items,
    };
}
