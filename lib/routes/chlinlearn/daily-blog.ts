import CryptoJS from 'crypto-js';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/daily-blog',
    name: '值得一读技术博客',
    maintainers: ['huyyi'],
    categories: ['programming'],
    example: '/chlinlearn/daily-blog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['daily-blog.chlinlearn.top/blogs/*'],
            target: '/daily-blog',
        },
    ],
    handler: async () => {
        const r = CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Hex);
        const n = Date.now();
        const o = CryptoJS.SHA256('pHVp671B0tLkW40KCwyPrb6W1GEMEGyT' + r + n).toString(CryptoJS.enc.Hex);
        const data = await ofetch('https://daily-blog.chlinlearn.top/api/daily-blog/getBlogs/new?type=new&pageNum=1&pageSize=20', {
            headers: {
                Referer: 'https://daily-blog.chlinlearn.top/blogs/1',
                'x-req-nonce': r,
                'x-req-timestamp': String(n),
                'x-req-key': o,
            },
        });
        const items = data.rows.map((item) => ({
            title: item.title,
            link: item.url,
            author: item.author,
            pubDate: timezone(parseDate(item.publishTime), 8),
        }));
        return {
            title: '值得一读技术博客',
            link: 'https://daily-blog.chlinlearn.top/blogs/1',
            item: items,
        };
    },
};
