import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['study'],
    example: '/youdao/latest',
    name: '笔记最新动态',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://xueba.youdao.com';
    const apiUrl = `${rootUrl}/yws/mapi/xueba/library?method=realTimeCollect&count=10`;
    const response = await ofetch(apiUrl, {
        headers: {
            Referer: `${rootUrl}/web/index.html`,
        },
        parseResponse: JSON.parse,
    });

    const list = response.Clt.map((item) => ({
        title: `${item.name} 保存了 ${item.title}`,
        pubDate: parseDate(item.time),
        link: `https://note.youdao.com/publicshare/?id=${item.shareKey}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const id = item.link.split('?id=', 2)[1];
                try {
                    const contentResponse = await ofetch(`https://note.youdao.com/yws/public/notebook/${id}`, { parseResponse: JSON.parse });
                    const notes = contentResponse[2];
                    item.description = notes.map((note) => `<h3><a href="https://note.youdao.com/publicshare?id=${id}#${note.p}">${note.tl}</a></h3>`).join('');
                } catch {
                    const contentResponse = await ofetch(`https://note.youdao.com/yws/public/note/${id}`, { parseResponse: JSON.parse });
                    item.description = contentResponse.content;
                }
                return item;
            })
        )
    );

    return {
        title: '笔记最新动态 - 有道云笔记',
        link: `${rootUrl}/web/index.html`,
        item: items,
    };
}
