import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { encrypt, decrypt } from './utils';
import { EncryptedResponse, WebBlog } from './types';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/search',
    name: '最新',
    categories: ['finance'],
    example: '/stream-capital/search',
    maintainers: ['TonyRL'],
    handler,
    radar: [
        {
            source: ['www.stream-capital.com/search'],
        },
    ],
};

async function handler() {
    const baseUrl = 'https://www.stream-capital.com';
    const apiBaseUrl = 'https://api.yuanchuan.cn';

    const response = await ofetch<EncryptedResponse>(`${apiBaseUrl}/yc/webbloglist`, {
        method: 'POST',
        query: {
            apptype: 9,
        },
        body: encrypt(
            JSON.stringify({
                type: 0,
                name: null,
                page: 1,
            })
        ),
    });

    const list = (JSON.parse(decrypt(response.data)).list as WebBlog[]).map((item) => ({
        title: item.title,
        author: item.userName,
        pubDate: timezone(parseDate(item.ctime, 'YYYY-MM-DD HH:mm:ss'), 8),
        link: `${baseUrl}/article/${item.id}`,
        description: item.content,
        category: item.tags.map((t) => t.tagName),
        id: item.id,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch<EncryptedResponse>(`${apiBaseUrl}/yc/webblogdetail`, {
                    method: 'POST',
                    query: {
                        apptype: 9,
                    },
                    body: encrypt(
                        JSON.stringify({
                            blogId: item.id,
                        })
                    ),
                });

                item.description = (JSON.parse(decrypt(response.data)) as WebBlog).detailInfo.articleContent;

                return item;
            })
        )
    );

    return {
        title: '最新 - 远川研究所',
        link: `${baseUrl}/search`,
        language: 'zh',
        item: items,
    };
}
