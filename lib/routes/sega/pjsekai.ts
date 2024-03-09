import got from '@/utils/got';
import * as cheerio from 'cheerio';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
export default async (ctx) => {
    // 从仓库 Sekai-World/sekai-master-db-diff 获取最新公告
    const response = await got.get(`https://cdn.jsdelivr.net/gh/Sekai-World/sekai-master-db-diff@master/userInformations.json`);
    const posts = response.data || [];
    const list = await Promise.all(
        posts.map(async (post) => {
            let link = '';
            let description = '';
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
    ctx.set('data', {
        title: 'Project Sekai - News',
        link: 'https://pjsekai.sega.jp/',
        description: 'プロジェクトセカイ カラフルステージ！ feat.初音ミク',
        item: list,
    });
};
