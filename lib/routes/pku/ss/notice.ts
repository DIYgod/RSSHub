import type { Route } from '@/types';
import cache from '@/utils/cache';

import { baseUrl, getArticle, getSingleRecord } from './common';

const host = `${baseUrl}/newscenter/notice/`;

export const route: Route = {
    path: '/ss/notice',
    radar: [
        {
            source: ['ss.pku.edu.cn/index.php/newscenter/notice', 'ss.pku.edu.cn/'],
        },
    ],
    name: 'Unknown',
    maintainers: ['legr4ndk'],
    handler,
    url: 'ss.pku.edu.cn/index.php/newscenter/notice',
};

async function handler() {
    const items = await getSingleRecord(host);
    const out = await Promise.all(items.map((item) => getArticle(item, cache.tryGet)));

    return {
        title: '北大软微-通知公告',
        description: '北京大学软件与微电子学院 - 通知公告',
        link: host,
        item: out,
    };
}
