import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

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
    const response = await got.get(`https://cdn.jsdelivr.net/gh/Sekai-World/sekai-master-db-diff@master/userInformations.json`);
    const posts = response.data || [];
    const list = await Promise.all(
        posts.map(async (post) => {
            let link: string;
            let description: string;
            const guid = post.displayOrder.toString() + post.id.toString(); // 双ID
            if (post.path.startsWith('information/')) {
                // information 公告
                const path = post.path.replace(/information\/index.html\?id=/, '');
                link = `https://production-web.sekai.colorfulpalette.org/${post.path}`;
                try {
                    description = await cache.tryGet(guid, async () => {
                        const result = await got.get(`https://production-web.sekai.colorfulpalette.org/html/${path}.html`);
                        const $ = cheerio.load(result.data);
                        return $.html();
                    });
                } catch {
                    description = link;
                }
            } else {
                // 外链
                link = post.path;
                description = post.title;
            }

            const item = {
                title: post.title,
                link,
                pubDate: timezone(new Date(post.startAt), +8), // +8时区
                description,
                category: post.informationTag, // event,gacha,music,bug,information
                guid,
            };
            return item;
        })
    );
    return {
        title: 'Project Sekai - News',
        link: 'https://pjsekai.sega.jp/',
        description: 'プロジェクトセカイ カラフルステージ！ feat.初音ミク',
        item: list,
    };
}
