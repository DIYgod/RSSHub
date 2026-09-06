import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/xueba',
    categories: ['study'],
    example: '/youdao/xueba',
    name: '学霸感悟',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://xueba.youdao.com';
    const apiUrl = `${rootUrl}/yws/mapi/xueba/library?method=search`;
    const response = await ofetch(apiUrl, {
        method: 'POST',
        headers: {
            Referer: `${rootUrl}/web/index.html`,
        },
        parseResponse: JSON.parse,
        body: new URLSearchParams({
            keyword: '',
            begin: '0',
            count: '9',
            primary_category: '4',
        }),
    });

    const authors = {};

    for (const author of response.xuebas) {
        authors[author.uid] = author.name;
    }

    const list = response.notes.map((item) => ({
        type: item.type,
        title: item.title,
        author: item.userId,
        description: item.description,
        pubDate: parseDate(item.upt),
        link: `http://note.youdao.com/publicshare/?type=${item.type}&id=${item.id}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const id = item.link.split('&id=', 2)[1];
                    const contentResponse = await ofetch(`http://note.youdao.com/yws/public/${item.type}/${id}`, { parseResponse: JSON.parse });
                    if (item.type === 'note') {
                        item.description = contentResponse.content;
                    } else {
                        const notes = contentResponse[2];
                        item.description = notes.map((note) => `<h3><a href="http://note.youdao.com/publicshare?id=${id}#${note.p}">${note.tl}</a></h3>`).join('');
                    }
                } catch {
                    // deleted
                } finally {
                    item.author = authors[item.author];
                }
                return item;
            })
        )
    );

    return {
        title: '学霸感悟 - 有道云笔记',
        link: `${rootUrl}/web/index.html#4`,
        item: items,
    };
}
