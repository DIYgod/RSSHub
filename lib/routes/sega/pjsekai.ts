import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/pjsekai/news',
    categories: ['game'],
    example: '/sega/pjsekai/news',
    parameters: {},
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
            source: ['pjsekai.sega.jp/news/index.html'],
        },
    ],
    name: '世界计划 多彩舞台 ｜ ProjectSekai ｜ プロセカ',
    maintainers: ['15x15G'],
    handler,
    url: 'pjsekai.sega.jp/news/index.html',
};

async function handler() {
    // 从仓库 Sekai-World/sekai-master-db-diff 获取最新公告
    const response = await got.get('https://cdn.jsdelivr.net/gh/Sekai-World/sekai-master-db-diff@master/userInformations.json');
    const posts: Array<{
        displayOrder: number;
        id: number;
        title: string;
        path: string;
        startAt?: number;
        informationTag: string;
    }> = response.data || [];
    const list = await pMap(
        posts,
        async (post) => {
            let link: string;
            let description: string;
            const guid = post.displayOrder.toString() + post.id.toString(); // 双ID
            if (post.path.startsWith('information/')) {
                // information 公告
                const path = post.path.replace(/information\/index.html\?id=/, '');
                link = `https://production-web.sekai.colorfulpalette.org/${post.path}`;
                description = await cache.tryGet(guid, async () => {
                    const result = await got.get(`https://production-web.sekai.colorfulpalette.org/html/${path}.html`);
                    const $ = load(result.data);
                    return $.html();
                });
            } else {
                // 外链
                link = post.path;
                description = post.title;
            }

            const item = {
                title: post.title,
                link,
                pubDate: post.startAt === undefined ? undefined : parseDate(post.startAt),
                description,
                category: post.informationTag, // event,gacha,music,bug,information
                guid,
            };
            return item;
        },
        { concurrency: 3 }
    );
    return {
        title: 'Project Sekai - News',
        link: 'https://pjsekai.sega.jp/',
        description: 'プロジェクトセカイ カラフルステージ！ feat.初音ミク',
        item: list,
    };
}
